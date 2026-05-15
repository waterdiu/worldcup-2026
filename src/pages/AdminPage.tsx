import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminDashboard, type AdminPagePermissionRecord, type AdminProfileRecord } from '../hooks/useAdminDashboard';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { type AppCopy } from '../i18n/content';
import { formatBracketLabel, formatTeamName } from '../i18n/formatters';
import { getAuthDisplayName, isSupabaseConfigured } from '../lib/supabase';
import type { BracketRoundData, FinalsMatchResultData, GroupStageMatchData } from '../types/tournament';

type AdminTab = 'users' | 'stats' | 'permissions';

interface AdminPageProps {
  bracket: BracketRoundData[];
  copy: AppCopy;
  finalsMatchResults: FinalsMatchResultData[];
  groupStageMatches: GroupStageMatchData[];
}

interface MatchSummary {
  id: string;
  title: string;
  status: 'scheduled' | 'completed';
  resultLabel: string;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatStatus(status: string | null | undefined, isZh: boolean) {
  const value = status ?? 'pending';
  const labels: Record<string, string> = isZh
    ? { pending: '待审批', active: '已启用', disabled: '已禁用', rejected: '已拒绝' }
    : { pending: 'Pending', active: 'Active', disabled: 'Disabled', rejected: 'Rejected' };
  return labels[value] ?? value;
}

function formatWinner(winner: string, isZh: boolean) {
  if (winner === 'home') return isZh ? '主胜' : 'Home win';
  if (winner === 'away') return isZh ? '客胜' : 'Away win';
  return isZh ? '平局' : 'Draw';
}

function formatResultLabel(match: MatchSummary, isZh: boolean) {
  if (match.status !== 'completed') return isZh ? '赛果待定' : 'Pending';
  return match.resultLabel;
}

function buildMatchLookup(
  locale: AppCopy['locale'],
  groupStageMatches: GroupStageMatchData[],
  bracket: BracketRoundData[],
  finalsMatchResults: FinalsMatchResultData[]
) {
  const resultById = new Map(finalsMatchResults.map((result) => [result.id, result]));
  const groupMatches = groupStageMatches.map((match) => ({
    id: match.id,
    title: `${formatTeamName(match.homeTeam, locale)} VS ${formatTeamName(match.awayTeam, locale)}`,
    status: resultById.get(match.id)?.status ?? 'scheduled',
    resultLabel:
      resultById.get(match.id)?.homeScore !== undefined && resultById.get(match.id)?.awayScore !== undefined
        ? `${resultById.get(match.id)?.homeScore}-${resultById.get(match.id)?.awayScore}`
        : ''
  }));
  const knockoutMatches = bracket.flatMap((round) =>
    round.matches.map((match) => ({
      id: match.id,
      title: `${formatBracketLabel(match.homeLabel, locale)} VS ${formatBracketLabel(match.awayLabel, locale)}`,
      status: resultById.get(match.id)?.status ?? 'scheduled',
      resultLabel:
        resultById.get(match.id)?.homeScore !== undefined && resultById.get(match.id)?.awayScore !== undefined
          ? `${resultById.get(match.id)?.homeScore}-${resultById.get(match.id)?.awayScore}`
          : ''
    }))
  );
  return new Map([...groupMatches, ...knockoutMatches].map((match) => [match.id, match]));
}

function getMatchTitle(matchLookup: Map<string, MatchSummary>, id: string, isZh: boolean) {
  return matchLookup.get(id)?.title ?? (isZh ? `比赛 ${id}` : `Match ${id}`);
}

function getMatchResult(matchLookup: Map<string, MatchSummary>, id: string, isZh: boolean) {
  const match = matchLookup.get(id);
  return match ? formatResultLabel(match, isZh) : isZh ? '赛果待定' : 'Pending';
}

function getProfileName(profileById: Map<string, AdminProfileRecord>, userId: string, isZh: boolean) {
  const profile = profileById.get(userId);
  return profile?.display_name || profile?.email || (isZh ? '未知用户' : 'Unknown user');
}

function getAccessLevel(permission: AdminPagePermissionRecord) {
  if (permission.admin_only) return 'admin';
  if (permission.require_login) return 'login';
  return 'public';
}

function getAccessLabel(level: string, isZh: boolean) {
  if (level === 'admin') return isZh ? '管理员' : 'Admin';
  if (level === 'login') return isZh ? '登录用户' : 'Signed in';
  return isZh ? '公开' : 'Public';
}

function toPermissionLevel(permission: AdminPagePermissionRecord, level: string): AdminPagePermissionRecord {
  return {
    ...permission,
    require_login: level === 'login' || level === 'admin',
    admin_only: level === 'admin'
  };
}

export function AdminPage({ bracket, copy, finalsMatchResults, groupStageMatches }: AdminPageProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus(user);
  const dashboard = useAdminDashboard(Boolean(user && isAdmin));
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const isZh = copy.locale === 'zh';
  const pendingUsers = dashboard.profiles.filter((profile) => (profile.status ?? 'pending') === 'pending');
  const activeUsers = dashboard.profiles.filter((profile) => (profile.status ?? 'pending') === 'active');
  const disabledUsers = dashboard.profiles.filter((profile) => (profile.status ?? 'pending') === 'disabled');
  const roleByUserId = new Map(dashboard.roles.map((role) => [role.user_id, role.role]));
  const profileById = useMemo(
    () => new Map(dashboard.profiles.map((profile) => [profile.id, profile])),
    [dashboard.profiles]
  );
  const matchLookup = useMemo(
    () => buildMatchLookup(copy.locale, groupStageMatches, bracket, finalsMatchResults),
    [bracket, copy.locale, finalsMatchResults, groupStageMatches]
  );
  const predictionUserCount = new Set(dashboard.predictions.map((prediction) => prediction.user_id)).size;
  const avgPredictions = dashboard.profiles.length ? (dashboard.predictions.length / dashboard.profiles.length).toFixed(1) : '0';
  const favoriteCountByMatch = dashboard.favorites.reduce<Record<string, number>>((counts, favorite) => {
    if (favorite.target_type !== 'match') return counts;
    counts[favorite.target_id] = (counts[favorite.target_id] ?? 0) + 1;
    return counts;
  }, {});
  const predictionCountByMatch = dashboard.predictions.reduce<Record<string, number>>((counts, prediction) => {
    counts[prediction.match_id] = (counts[prediction.match_id] ?? 0) + 1;
    return counts;
  }, {});
  const mostFavoritedMatch = Object.entries(favoriteCountByMatch).sort((a, b) => b[1] - a[1])[0];
  const mostPredictedMatch = Object.entries(predictionCountByMatch).sort((a, b) => b[1] - a[1])[0];
  const fallbackPagePermissions = useMemo<AdminPagePermissionRecord[]>(
    () => [
      { path: '/', label: '首页', require_login: false, admin_only: false, updated_at: '' },
      { path: '/qualifiers', label: '预选赛', require_login: false, admin_only: false, updated_at: '' },
      { path: '/qualifiers/*', label: '预选赛子页面', require_login: false, admin_only: false, updated_at: '' },
      { path: '/stats', label: '统计', require_login: false, admin_only: false, updated_at: '' },
      { path: '/groups', label: '小组', require_login: false, admin_only: false, updated_at: '' },
      { path: '/groups/*', label: '小组子页面', require_login: false, admin_only: false, updated_at: '' },
      { path: '/matches', label: '比赛', require_login: false, admin_only: false, updated_at: '' },
      { path: '/matches/*', label: '比赛详情', require_login: false, admin_only: false, updated_at: '' },
      { path: '/teams', label: '球队', require_login: false, admin_only: false, updated_at: '' },
      { path: '/teams/*', label: '球队详情', require_login: false, admin_only: false, updated_at: '' },
      { path: '/cities', label: '城市', require_login: false, admin_only: false, updated_at: '' },
      { path: '/cities/*', label: '城市详情', require_login: false, admin_only: false, updated_at: '' },
      { path: '/me', label: '我的', require_login: true, admin_only: false, updated_at: '' },
      { path: '/admin', label: '管理后台', require_login: true, admin_only: true, updated_at: '' }
    ],
    []
  );
  const permissionByPath = new Map(dashboard.pagePermissions.map((permission) => [permission.path, permission]));
  const pagePermissions = fallbackPagePermissions.map((permission) => permissionByPath.get(permission.path) ?? permission);

  if (!isSupabaseConfigured) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理后台' : 'Admin Console'}</span>
          <h1>{isZh ? 'Supabase 尚未配置' : 'Supabase is not configured'}</h1>
          <p>{isZh ? '需要先配置 Supabase URL 和 anon key。' : 'Configure the Supabase URL and anon key first.'}</p>
        </article>
      </section>
    );
  }

  if (!user && !authLoading) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理后台' : 'Admin Console'}</span>
          <h1>{isZh ? '管理员登录' : 'Admin Sign In'}</h1>
          <p>{isZh ? '请先登录管理员账号。' : 'Sign in with an administrator account.'}</p>
          <button type="button" onClick={signInWithGoogle}>{isZh ? '使用 Google 登录' : 'Sign in with Google'}</button>
        </article>
      </section>
    );
  }

  if (authLoading || adminLoading) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理后台' : 'Admin Console'}</span>
          <h1>{isZh ? '正在检查权限' : 'Checking Access'}</h1>
        </article>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理后台' : 'Admin Console'}</span>
          <h1>{isZh ? '没有管理员权限' : 'No Admin Access'}</h1>
          <p>
            {isZh
              ? `当前账号 ${getAuthDisplayName(user)} 没有 admin 角色。`
              : `Current account ${getAuthDisplayName(user)} does not have the admin role.`}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="section admin-page stats-page">
      <div className="admin-console-topbar">
        <div className="admin-console-brand">
          <strong>WC 2026</strong>
          <span>{isZh ? '管理后台' : 'Admin'}</span>
        </div>
        <label className="admin-console-search">
          <span>{isZh ? '搜索' : 'Search'}</span>
          <input type="search" placeholder={isZh ? '搜索用户、比赛、页面...' : 'Search users, matches, pages...'} />
        </label>
        <div className="admin-console-user">
          <span>{getAuthDisplayName(user)}</span>
          <b>ADMIN</b>
        </div>
      </div>

      <article className="admin-hero">
        <span>{isZh ? '后台控制台' : 'Control console'}</span>
        <h1>{isZh ? '管理后台' : 'Admin Console'}</h1>
      </article>

      {dashboard.error ? (
        <article className="admin-card admin-card--warning">
          <h2>{isZh ? '后台数据暂不可用' : 'Admin data is unavailable'}</h2>
          <p>{dashboard.error}</p>
        </article>
      ) : null}

      <div className="admin-tabs" role="tablist" aria-label={isZh ? '后台模块' : 'Admin modules'}>
          <button className={activeTab === 'users' ? 'is-active' : undefined} type="button" onClick={() => setActiveTab('users')}>
            {isZh ? '用户管理' : 'Users'}
          </button>
          <button className={activeTab === 'stats' ? 'is-active' : undefined} type="button" onClick={() => setActiveTab('stats')}>
            {isZh ? '数据统计' : 'Statistics'}
          </button>
          <button className={activeTab === 'permissions' ? 'is-active' : undefined} type="button" onClick={() => setActiveTab('permissions')}>
            {isZh ? '权限设置' : 'Permissions'}
          </button>
      </div>

        <div className="stats-content">
          {activeTab === 'users' ? (
            <section className="stats-section">
              <h2>{isZh ? '用户管理' : 'User Management'}</h2>
              <article className="admin-card admin-card--compact">
                <div className="admin-table-toolbar">
                  <h3>{isZh ? '所有用户' : 'All Users'}</h3>
                  <button
                    type="button"
                    className="admin-icon-button"
                    disabled
                  >
                    <span aria-hidden="true">+</span>
                    {isZh ? '新增用户' : 'New user'}
                  </button>
                </div>
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--users">
                    <span>{isZh ? '用户名' : 'Name'}</span>
                    <span>Email</span>
                    <span>{isZh ? '注册方式' : 'Provider'}</span>
                    <span>{isZh ? '状态' : 'Status'}</span>
                    <span>{isZh ? '角色' : 'Role'}</span>
                    <span>{isZh ? '注册时间' : 'Created'}</span>
                    <span>{isZh ? '操作' : 'Actions'}</span>
                  </div>
                  {dashboard.profiles.map((profile) => {
                    const status = profile.status ?? 'pending';
                    const role = roleByUserId.get(profile.id) === 'admin' ? 'admin' : 'user';
                    return (
                      <div className="admin-data-row admin-data-row--users" key={profile.id}>
                        <span className="admin-user-cell">
                          <b>{profile.display_name || profile.email || (isZh ? '未命名用户' : 'Unnamed user')}</b>
                          <small>{profile.id}</small>
                        </span>
                        <span>{profile.email || '-'}</span>
                        <span>{profile.email ? (isZh ? '邮箱/Google' : 'Email/Google') : '-'}</span>
                        <span className={`admin-status-chip is-${status}`}>{formatStatus(status, isZh)}</span>
                        <span className={`admin-role-chip is-${role}`}>{role === 'admin' ? (isZh ? '管理员' : 'Admin') : (isZh ? '普通用户' : 'User')}</span>
                        <span>{formatDate(profile.created_at)}</span>
                        <div className="admin-row-actions admin-row-actions--users">
                          {status !== 'active' ? (
                            <button type="button" onClick={() => dashboard.saveProfile({ ...profile, status: 'active' })}>{isZh ? '通过' : 'Approve'}</button>
                          ) : null}
                          {status !== 'disabled' ? (
                            <button type="button" className="admin-button--secondary" onClick={() => dashboard.saveProfile({ ...profile, status: 'disabled' })}>{isZh ? '置为不可用' : 'Disable'}</button>
                          ) : null}
                          {status !== 'rejected' ? (
                            <button type="button" className="admin-button--secondary" onClick={() => dashboard.saveProfile({ ...profile, status: 'rejected' })}>{isZh ? '拒绝' : 'Reject'}</button>
                          ) : null}
                          <button
                            type="button"
                            className="admin-button--secondary"
                            onClick={() => dashboard.saveRole(profile.id, role === 'admin' ? null : 'admin')}
                          >
                            {role === 'admin' ? (isZh ? '取消管理员' : 'Remove admin') : (isZh ? '设为管理员' : 'Make admin')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === 'stats' ? (
            <section className="stats-section">
              <h2>{isZh ? '数据统计' : 'Statistics'}</h2>
              <div className="stats-kpi-grid admin-kpi-grid">
                <article><span>{isZh ? '总用户数' : 'Users'}</span><strong>{dashboard.profiles.length}</strong><small>{isZh ? '全部账号' : 'All accounts'}</small></article>
                <article><span>{isZh ? '待审批用户' : 'Pending'}</span><strong>{pendingUsers.length}</strong><small>{isZh ? '需要处理' : 'Needs review'}</small></article>
                <article><span>{isZh ? '已启用用户' : 'Active'}</span><strong>{activeUsers.length}</strong><small>{isZh ? '可正常使用' : 'Enabled'}</small></article>
                <article><span>{isZh ? '禁用用户' : 'Disabled'}</span><strong>{disabledUsers.length}</strong><small>{isZh ? '已限制' : 'Restricted'}</small></article>
                <article><span>{isZh ? '预测用户数' : 'Predictors'}</span><strong>{predictionUserCount}</strong><small>{isZh ? `人均 ${avgPredictions}` : `Avg ${avgPredictions}`}</small></article>
              </div>
              <div className="stats-panel-grid">
                <article className="stats-panel">
                  <h3>{isZh ? '互动概览' : 'Engagement'}</h3>
                  <div className="admin-mini-metrics">
                    <div><span>{isZh ? '收藏总数' : 'Favorites'}</span><strong>{dashboard.favorites.length}</strong></div>
                    <div><span>{isZh ? '预测总数' : 'Predictions'}</span><strong>{dashboard.predictions.length}</strong></div>
                    <div><span>{isZh ? '收藏最多比赛' : 'Top saved match'}</span><strong>{mostFavoritedMatch ? getMatchTitle(matchLookup, mostFavoritedMatch[0], isZh) : '-'}</strong></div>
                    <div><span>{isZh ? '预测最多比赛' : 'Top predicted match'}</span><strong>{mostPredictedMatch ? getMatchTitle(matchLookup, mostPredictedMatch[0], isZh) : '-'}</strong></div>
                  </div>
                </article>
                <article className="stats-panel">
                  <h3>{isZh ? '用户状态' : 'User Status'}</h3>
                  <div className="admin-mini-metrics">
                    <div><span>{isZh ? '待审批' : 'Pending'}</span><strong>{pendingUsers.length}</strong></div>
                    <div><span>{isZh ? '启用' : 'Active'}</span><strong>{activeUsers.length}</strong></div>
                    <div><span>{isZh ? '禁用' : 'Disabled'}</span><strong>{disabledUsers.length}</strong></div>
                    <div><span>{isZh ? '管理员' : 'Admins'}</span><strong>{dashboard.roles.length}</strong></div>
                  </div>
                </article>
              </div>
              <details className="admin-record-panel">
                <summary>{isZh ? '收藏记录' : 'Favorite Records'}</summary>
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--records">
                    <span>{isZh ? '用户名' : 'User'}</span>
                    <span>{isZh ? '比赛名' : 'Match'}</span>
                    <span>{isZh ? '收藏时间' : 'Saved at'}</span>
                  </div>
                  {dashboard.favorites.map((favorite) => (
                    <div className="admin-data-row admin-data-row--records" key={favorite.id}>
                      <span>{getProfileName(profileById, favorite.user_id, isZh)}</span>
                      <span>{favorite.target_type === 'match' ? getMatchTitle(matchLookup, favorite.target_id, isZh) : favorite.target_id}</span>
                      <span>{formatDate(favorite.created_at)}</span>
                    </div>
                  ))}
                </div>
              </details>
              <details className="admin-record-panel">
                <summary>{isZh ? '预测记录' : 'Prediction Records'}</summary>
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--prediction-records">
                    <span>{isZh ? '用户名' : 'User'}</span>
                    <span>{isZh ? '比赛名' : 'Match'}</span>
                    <span>{isZh ? '胜负预测' : 'Pick'}</span>
                    <span>{isZh ? '比分预测' : 'Score'}</span>
                    <span>{isZh ? '实际结果' : 'Result'}</span>
                  </div>
                  {dashboard.predictions.map((prediction) => (
                    <div className="admin-data-row admin-data-row--prediction-records" key={prediction.id}>
                      <span>{getProfileName(profileById, prediction.user_id, isZh)}</span>
                      <span>{getMatchTitle(matchLookup, prediction.match_id, isZh)}</span>
                      <span>{formatWinner(prediction.winner, isZh)}</span>
                      <span>{prediction.home_score}-{prediction.away_score}</span>
                      <span>{getMatchResult(matchLookup, prediction.match_id, isZh)}</span>
                    </div>
                  ))}
                </div>
              </details>
            </section>
          ) : null}

          {activeTab === 'permissions' ? (
            <section className="stats-section">
              <h2>{isZh ? '权限设置' : 'Permissions'}</h2>
              <article className="admin-card admin-card--compact">
                <h3>{isZh ? '页面默认权限' : 'Default Page Access'}</h3>
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--permissions">
                    <span>{isZh ? '页面名称' : 'Page'}</span>
                    <span>{isZh ? '路径' : 'Path'}</span>
                    <span>{isZh ? '默认访问级别' : 'Default access'}</span>
                    <span>{isZh ? '当前' : 'Current'}</span>
                  </div>
                  {pagePermissions.map((permission) => (
                    <div className="admin-data-row admin-data-row--permissions" key={permission.path}>
                      <span>{permission.label}</span>
                      <span>{permission.path}</span>
                      <span className="admin-segmented-control">
                        {['public', 'login', 'admin'].map((level) => (
                          <button
                            key={level}
                            type="button"
                            className={getAccessLevel(permission) === level ? 'is-active' : undefined}
                            onClick={() => dashboard.savePagePermission(toPermissionLevel(permission, level))}
                          >
                            {getAccessLabel(level, isZh)}
                          </button>
                        ))}
                      </span>
                      <span className="admin-current-access">{getAccessLabel(getAccessLevel(permission), isZh)}</span>
                    </div>
                  ))}
                </div>
              </article>
              <article className="admin-card admin-card--compact">
                <h3>{isZh ? '用户单独权限' : 'Per-user Access'}</h3>
                <div className="admin-user-list">
                  {dashboard.profiles.map((profile) => (
                    <div className="admin-user-permission-card" key={profile.id}>
                      <div className="admin-user-permission-card__head">
                        <strong>{profile.display_name || profile.email || profile.id}</strong>
                        <span>{formatStatus(profile.status, isZh)} · {roleByUserId.get(profile.id) === 'admin' ? (isZh ? '管理员' : 'Admin') : (isZh ? '普通用户' : 'User')}</span>
                      </div>
                      <div className="admin-permission-grid">
                        {pagePermissions.map((permission) => {
                          const existing = dashboard.userPagePermissions.find((item) => item.user_id === profile.id && item.path === permission.path);
                          const checked = existing?.can_access ?? true;
                          return (
                            <label className={checked ? 'is-allowed' : 'is-denied'} key={permission.path}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  dashboard.saveUserPagePermission({
                                    user_id: profile.id,
                                    path: permission.path,
                                    can_access: event.target.checked,
                                    requires_approval: existing?.requires_approval ?? false
                                  })
                                }
                              />
                              <span>{permission.label}</span>
                              <em>{checked ? (isZh ? '允许' : 'Allow') : (isZh ? '禁止' : 'Deny')}</em>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : null}
      </div>
    </section>
  );
}
