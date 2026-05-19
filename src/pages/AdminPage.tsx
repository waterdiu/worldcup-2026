import { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdminDashboard, type AdminPagePermissionRecord, type AdminProfileRecord } from '../hooks/useAdminDashboard';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { type AppCopy } from '../i18n/content';
import { localizePath } from '../i18n/content';
import { formatBracketLabel, formatTeamName } from '../i18n/formatters';
import { getAuthDisplayName, isSupabaseConfigured } from '../lib/supabase';
import type { BracketRoundData, FinalsMatchResultData, GroupStageMatchData } from '../types/tournament';
import { formatBeijingMonthDayKickoff } from '../utils/beijingTime';
import type { PeopleIndexEntry, PersonProfile } from '../data/mockPeople';
import type { WorldCupOfficial, WorldCupOfficialRole } from '../data/siteData';

type AdminTab =
  | 'dashboard'
  | 'activity'
  | 'matches'
  | 'scores'
  | 'groups'
  | 'people'
  | 'users'
  | 'predictions'
  | 'favorites'
  | 'permissions'
  | 'settings';

interface AdminPageProps {
  bracket: BracketRoundData[];
  copy: AppCopy;
  finalsMatchResults: FinalsMatchResultData[];
  groupStageMatches: GroupStageMatchData[];
  peopleIndex: PeopleIndexEntry[];
  coachProfiles: PersonProfile[];
  playerProfiles: PersonProfile[];
  refereeProfiles: PersonProfile[];
  officials: WorldCupOfficial[];
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

function getPersonHref(kind: 'coach' | 'player' | 'referee', personId: string, locale: AppCopy['locale']) {
  const segment = kind === 'coach' ? 'coaches' : kind === 'player' ? 'players' : 'referees';
  return localizePath(`/people/${segment}/${encodeURIComponent(personId)}`, locale);
}

function normalizePeopleQuery(value: string) {
  return value.trim().toLowerCase();
}

function roleLabel(role: WorldCupOfficialRole, locale: AppCopy['locale']) {
  if (locale === 'en') {
    if (role === 'referee') return 'Referee';
    if (role === 'assistant_referee') return 'Assistant';
    if (role === 'video_match_official') return 'VMO';
    if (role === 'fourth_official') return 'Fourth';
    if (role === 'support_referee') return 'Support';
    return 'Other';
  }
  if (role === 'referee') return '主裁';
  if (role === 'assistant_referee') return '助理裁判';
  if (role === 'video_match_official') return '视频官员';
  if (role === 'fourth_official') return '第四官员';
  if (role === 'support_referee') return '支持裁判';
  return '其他';
}

function toPermissionLevel(permission: AdminPagePermissionRecord, level: string): AdminPagePermissionRecord {
  return {
    ...permission,
    require_login: level === 'login' || level === 'admin',
    admin_only: level === 'admin'
  };
}

export function AdminPage({
  bracket,
  copy,
  finalsMatchResults,
  groupStageMatches,
  peopleIndex,
  coachProfiles,
  playerProfiles,
  refereeProfiles,
  officials
}: AdminPageProps) {
  // NOTE: Admin-only UI reads tournament datasets from the same runtime bundle as the public pages.
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus(user);
  const dashboard = useAdminDashboard(Boolean(user && isAdmin));
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [peopleScope, setPeopleScope] = useState<'coaches' | 'players' | 'referees'>('coaches');
  const [peopleQuery, setPeopleQuery] = useState('');
  const [officialRoleFilter, setOfficialRoleFilter] = useState<'all' | WorldCupOfficialRole>('referee');
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
  const completedMatches = finalsMatchResults.filter((match) => match.status === 'completed');
  const pendingScoreMatches = finalsMatchResults.filter((match) => match.status !== 'completed').slice(0, 6);
  const sampleMatches = groupStageMatches.slice(0, 8);
  const peopleProfiles = useMemo(() => {
    const query = normalizePeopleQuery(peopleQuery);

    if (peopleScope === 'referees') {
      const fifaOfficials = officials.filter((item) => item.source_status === 'official_fifa_match_official_list');
      const roleFiltered = officialRoleFilter === 'all' ? fifaOfficials : fifaOfficials.filter((item) => item.role === officialRoleFilter);
      const searched = query
        ? roleFiltered.filter((item) => {
            const tokens = [
              item.display_name,
              item.name_zh,
              item.country_name_en,
              item.country_name_zh,
              item.role,
              item.role_zh
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return tokens.includes(query);
          })
        : roleFiltered;

      return {
        kind: 'referee' as const,
        total: fifaOfficials.length,
        visible: searched.slice(0, 600),
        mode: 'officials' as const
      };
    }

    const scopeProfiles = peopleScope === 'coaches' ? coachProfiles : playerProfiles;
    const kind: PeopleIndexEntry['kind'] = peopleScope === 'coaches' ? 'coach' : 'player';

    const filtered = query
      ? scopeProfiles.filter((profile) => {
          const tokens = [
            profile.display_name,
            profile.name_zh,
            profile.primary_team_name,
            profile.country_name_en,
            profile.country_name_zh,
            profile.role_title_en,
            profile.role_title_zh
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return tokens.includes(query);
        })
      : scopeProfiles;

    return {
      kind,
      total: scopeProfiles.length,
      visible: filtered.slice(0, 400),
      mode: 'profiles' as const
    };
  }, [coachProfiles, officials, officialRoleFilter, peopleQuery, peopleScope, playerProfiles]);
  const adminNavGroups: Array<{
    label: string;
    items: Array<{ id: AdminTab; icon: string; label: string; badge?: string | number; tone?: 'red' | 'gold' | 'muted' }>;
  }> = [
    {
      label: isZh ? '概览' : 'Overview',
      items: [
        { id: 'dashboard', icon: '▣', label: isZh ? '仪表盘' : 'Dashboard' },
        { id: 'activity', icon: '◎', label: isZh ? '操作日志' : 'Activity' }
      ]
    },
    {
      label: isZh ? '赛事内容' : 'Tournament',
      items: [
        { id: 'matches', icon: '⚽', label: isZh ? '赛程管理' : 'Matches', badge: groupStageMatches.length, tone: 'gold' },
        { id: 'scores', icon: '✎', label: isZh ? '比分录入' : 'Scores', badge: pendingScoreMatches.length, tone: pendingScoreMatches.length ? 'red' : 'muted' },
        { id: 'groups', icon: '≡', label: isZh ? '积分榜' : 'Groups' },
        { id: 'people', icon: '⌁', label: isZh ? '人员' : 'People', badge: peopleIndex.length, tone: 'gold' }
      ]
    },
    {
      label: isZh ? '用户' : 'Users',
      items: [
        { id: 'users', icon: '◉', label: isZh ? '用户列表' : 'Users', badge: pendingUsers.length || undefined, tone: pendingUsers.length ? 'red' : 'muted' },
        { id: 'predictions', icon: '?', label: isZh ? '预测记录' : 'Predictions' },
        { id: 'favorites', icon: '★', label: isZh ? '收藏记录' : 'Favorites' }
      ]
    },
    {
      label: isZh ? '系统' : 'System',
      items: [
        { id: 'permissions', icon: '◈', label: isZh ? '权限配置' : 'Permissions' },
        { id: 'settings', icon: '⚙', label: isZh ? '系统设置' : 'Settings' }
      ]
    }
  ];
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

      {dashboard.error ? (
        <article className="admin-card admin-card--warning">
          <h2>{isZh ? '后台数据暂不可用' : 'Admin data is unavailable'}</h2>
          <p>{dashboard.error}</p>
        </article>
      ) : null}

      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label={isZh ? '管理后台导航' : 'Admin navigation'}>
          {adminNavGroups.map((group) => (
            <div className="admin-sidebar-group" key={group.label}>
              <span className="admin-sidebar-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  className={activeTab === item.id ? 'is-active' : undefined}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  key={item.id}
                >
                  <span>{item.icon}</span>
                  {item.label}
                  {item.badge ? <b className={item.tone ? `is-${item.tone}` : undefined}>{item.badge}</b> : null}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="admin-main">
          {activeTab === 'dashboard' ? (
            <section className="stats-section">
              <div className="admin-section-head">
                <h2>{isZh ? '仪表盘' : 'Dashboard'}</h2>
                <span>{isZh ? '实时数据 · Supabase' : 'Live data · Supabase'}</span>
              </div>
              <div className="stats-kpi-grid admin-kpi-grid">
                <article><span>{isZh ? '总用户' : 'Users'}</span><strong>{dashboard.profiles.length}</strong><small>{isZh ? '全部账号' : 'All accounts'}</small></article>
                <article><span>{isZh ? '待审批' : 'Pending'}</span><strong>{pendingUsers.length}</strong><small>{isZh ? '需处理' : 'Needs review'}</small></article>
                <article><span>{isZh ? '已完赛' : 'Completed'}</span><strong>{completedMatches.length}</strong><small>{isZh ? `待比分 ${pendingScoreMatches.length}` : `${pendingScoreMatches.length} pending`}</small></article>
                <article><span>{isZh ? '预测总数' : 'Predictions'}</span><strong>{dashboard.predictions.length}</strong><small>{isZh ? `${predictionUserCount} 个用户参与` : `${predictionUserCount} users`}</small></article>
                <article><span>{isZh ? '收藏总数' : 'Favorites'}</span><strong>{dashboard.favorites.length}</strong><small>{isZh ? '全部收藏记录' : 'All saved records'}</small></article>
                <article><span>{isZh ? '系统状态' : 'System'}</span><strong className="is-lime">●</strong><small>{isZh ? 'Supabase 已连接' : 'Supabase connected'}</small></article>
              </div>
              <div className="admin-dashboard-grid">
                <article>
                  <h3>{isZh ? '待处理事项' : 'Queue'}</h3>
                  <p><span>{isZh ? '待审批用户' : 'Pending users'}</span><b>{pendingUsers.length}</b></p>
                  <p><span>{isZh ? '未录入比分' : 'Pending scores'}</span><b>{pendingScoreMatches.length}</b></p>
                  <p><span>{isZh ? '异常预测' : 'Prediction issues'}</span><b>0</b></p>
                  <p><span>{isZh ? '系统告警' : 'System alerts'}</span><b>0</b></p>
                </article>
                <article>
                  <h3>{isZh ? '互动概览' : 'Engagement'}</h3>
                  <p><span>{isZh ? '收藏最多比赛' : 'Top saved match'}</span><b>{mostFavoritedMatch ? getMatchTitle(matchLookup, mostFavoritedMatch[0], isZh) : '-'}</b></p>
                  <p><span>{isZh ? '预测最多比赛' : 'Top predicted match'}</span><b>{mostPredictedMatch ? getMatchTitle(matchLookup, mostPredictedMatch[0], isZh) : '-'}</b></p>
                  <p><span>{isZh ? '人均预测' : 'Avg predictions'}</span><b>{avgPredictions}</b></p>
                </article>
                <article>
                  <h3>{isZh ? '内容概览' : 'Content'}</h3>
                  <p><span>{isZh ? '小组赛' : 'Group matches'}</span><b>{groupStageMatches.length}</b></p>
                  <p><span>{isZh ? '淘汰赛' : 'Knockout matches'}</span><b>{bracket.reduce((total, round) => total + round.matches.length, 0)}</b></p>
                  <p><span>{isZh ? '权限页面' : 'Permission pages'}</span><b>{pagePermissions.length}</b></p>
                </article>
              </div>
              <article className="admin-panel">
                <div className="admin-panel__head"><h3>{isZh ? '快速操作' : 'Quick Actions'}</h3></div>
                <div className="admin-quick-actions">
                  <button type="button" onClick={() => setActiveTab('scores')}>{isZh ? '录入比分' : 'Enter scores'}</button>
                  <button type="button" onClick={() => setActiveTab('users')}>{isZh ? `审批用户 (${pendingUsers.length})` : `Review users (${pendingUsers.length})`}</button>
                  <button type="button" onClick={() => setActiveTab('matches')}>{isZh ? '管理赛程' : 'Manage matches'}</button>
                  <button type="button" onClick={() => setActiveTab('permissions')}>{isZh ? '权限配置' : 'Permissions'}</button>
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === 'activity' ? (
            <section className="stats-section">
              <div className="admin-section-head"><h2>{isZh ? '操作日志' : 'Activity'}</h2><span>{isZh ? '最近动态' : 'Recent activity'}</span></div>
              <article className="admin-panel">
                <ul className="admin-feed">
                  <li><b />{isZh ? `待审批用户 ${pendingUsers.length} 个` : `${pendingUsers.length} users pending review`}<span>{isZh ? '系统' : 'System'}</span></li>
                  <li><b />{isZh ? `预测记录 ${dashboard.predictions.length} 条` : `${dashboard.predictions.length} prediction records`}<span>Supabase</span></li>
                  <li><b />{isZh ? `收藏记录 ${dashboard.favorites.length} 条` : `${dashboard.favorites.length} favorite records`}<span>Supabase</span></li>
                </ul>
              </article>
            </section>
          ) : null}

          {activeTab === 'matches' ? (
            <section className="stats-section">
              <div className="admin-section-head"><h2>{isZh ? '赛程管理' : 'Match Management'}</h2><span>{isZh ? `${groupStageMatches.length} 场小组赛` : `${groupStageMatches.length} group matches`}</span></div>
              <article className="admin-card admin-card--compact">
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--records"><span>{isZh ? '比赛' : 'Match'}</span><span>{isZh ? '分组' : 'Group'}</span><span>{isZh ? '时间' : 'Date'}</span></div>
                  {sampleMatches.map((match) => (
                    <div className="admin-data-row admin-data-row--records" key={match.id}>
                      <span>{formatTeamName(match.homeTeam, copy.locale)} VS {formatTeamName(match.awayTeam, copy.locale)}</span>
                      <span>{match.groupId}</span>
                      <span>{formatBeijingMonthDayKickoff(match.dateLabel, copy.locale)}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === 'scores' ? (
            <section className="stats-section">
              <div className="admin-section-head"><h2>{isZh ? '比分录入' : 'Score Entry'}</h2><span>{isZh ? '当前为只读结果视图' : 'Read-only result view'}</span></div>
              <article className="admin-card admin-card--compact">
                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--records"><span>{isZh ? '比赛' : 'Match'}</span><span>{isZh ? '状态' : 'Status'}</span><span>{isZh ? '比分' : 'Score'}</span></div>
                  {finalsMatchResults.slice(0, 10).map((match) => (
                    <div className="admin-data-row admin-data-row--records" key={match.id}>
                      <span>{getMatchTitle(matchLookup, match.id, isZh)}</span>
                      <span>{formatStatus(match.status, isZh)}</span>
                      <span>{match.homeScore !== undefined && match.awayScore !== undefined ? `${match.homeScore}-${match.awayScore}` : '-'}</span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : null}

          {activeTab === 'groups' ? (
            <section className="stats-section">
              <div className="admin-section-head"><h2>{isZh ? '积分榜' : 'Groups'}</h2><span>{isZh ? '由比赛结果自动计算' : 'Computed from match results'}</span></div>
              <div className="admin-dashboard-grid">
                {Array.from(new Set(groupStageMatches.map((match) => match.groupId))).slice(0, 6).map((groupId) => (
                  <article key={groupId}>
                    <h3>{isZh ? `${groupId} 组` : `Group ${groupId}`}</h3>
                    {Array.from(new Set(groupStageMatches.filter((match) => match.groupId === groupId).flatMap((match) => [match.homeTeam, match.awayTeam]))).slice(0, 4).map((team) => (
                      <p key={team}><span>{formatTeamName(team, copy.locale)}</span><b>0</b></p>
                    ))}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === 'people' ? (
            <section className="stats-section">
              <div className="admin-section-head">
                <h2>{isZh ? '人员' : 'People'}</h2>
                <span>
                  {peopleScope === 'players'
                    ? isZh
                      ? '球员名单可后续按官方 26 人名单增量补齐'
                      : 'Players can be finalized once official rosters are published'
                    : peopleScope === 'referees'
                      ? isZh
                        ? '当前仅展示主裁名单（不含助理裁判/VAR）；指派发布后可补齐完整裁判组'
                        : 'Currently listing head referees only (no assistants/VAR); crews can be completed after assignments are published'
                    : isZh
                      ? '名单来自数据层 core/person profiles'
                      : 'Roster sourced from data platform core person profiles'}
                </span>
              </div>

              <article className="admin-card admin-card--compact">
                <div className="admin-table-toolbar">
                  <h3>
                    {peopleScope === 'coaches'
                      ? isZh
                        ? `主教练（${peopleProfiles.total}）`
                        : `Head coaches (${peopleProfiles.total})`
                      : peopleScope === 'players'
                        ? isZh
                          ? `球员（${peopleProfiles.total}）`
                          : `Players (${peopleProfiles.total})`
                        : isZh
                          ? `裁判（${peopleProfiles.total}）`
                          : `Referees (${peopleProfiles.total})`}
                  </h3>
                  <div className="admin-people-controls" aria-label={isZh ? '人员筛选' : 'People filters'}>
                    <button type="button" className={peopleScope === 'coaches' ? 'is-active' : ''} onClick={() => setPeopleScope('coaches')}>
                      {isZh ? '主教练' : 'Coaches'}
                    </button>
                    <button type="button" className={peopleScope === 'players' ? 'is-active' : ''} onClick={() => setPeopleScope('players')}>
                      {isZh ? '球员' : 'Players'}
                    </button>
                    <button type="button" className={peopleScope === 'referees' ? 'is-active' : ''} onClick={() => setPeopleScope('referees')}>
                      {isZh ? '裁判' : 'Referees'}
                    </button>
                  </div>
                </div>

                <div className="admin-table-toolbar admin-table-toolbar--sub">
                  <label className="admin-console-search admin-console-search--inline">
                    <span>{isZh ? '搜索' : 'Search'}</span>
                    <input
                      type="search"
                      value={peopleQuery}
                      onChange={(event) => setPeopleQuery(event.target.value)}
                      placeholder={isZh ? '搜索姓名、球队、国籍...' : 'Search name, team, nation...'}
                    />
                  </label>
                  {peopleScope === 'referees' ? (
                    <div className="admin-people-controls" aria-label={isZh ? '裁判角色筛选' : 'Official role filters'}>
                      <button type="button" className={officialRoleFilter === 'referee' ? 'is-active' : ''} onClick={() => setOfficialRoleFilter('referee')}>
                        {isZh ? '主裁' : 'Referee'}
                      </button>
                      <button type="button" className={officialRoleFilter === 'assistant_referee' ? 'is-active' : ''} onClick={() => setOfficialRoleFilter('assistant_referee')}>
                        {isZh ? '助理' : 'Assistant'}
                      </button>
                      <button type="button" className={officialRoleFilter === 'video_match_official' ? 'is-active' : ''} onClick={() => setOfficialRoleFilter('video_match_official')}>
                        {isZh ? '视频官员' : 'VMO'}
                      </button>
                      <button type="button" className={officialRoleFilter === 'all' ? 'is-active' : ''} onClick={() => setOfficialRoleFilter('all')}>
                        {isZh ? '全部' : 'All'}
                      </button>
                    </div>
                  ) : null}
                  <span className="admin-muted">
                    {isZh ? `显示 ${peopleProfiles.visible.length} / ${peopleProfiles.total}` : `Showing ${peopleProfiles.visible.length} / ${peopleProfiles.total}`}
                  </span>
                </div>

                <div className="admin-data-table">
                  <div className="admin-data-row admin-data-row--head admin-data-row--records">
                    <span>{isZh ? '姓名' : 'Name'}</span>
                    <span>{peopleScope === 'referees' ? (isZh ? '角色' : 'Role') : (isZh ? '球队/归属' : 'Team')}</span>
                    <span>{isZh ? '国籍' : 'Nation'}</span>
                  </div>
                  {peopleProfiles.visible.length === 0 ? (
                    <div className="admin-data-row admin-data-row--records">
                      <span className="admin-muted">
                        {isZh ? '暂无可展示人员数据。' : 'No people records available.'}
                      </span>
                      <span />
                      <span />
                    </div>
                  ) : null}
                  {peopleProfiles.mode === 'officials'
                    ? (peopleProfiles.visible as WorldCupOfficial[]).map((official) => (
                        <a
                          key={official.person_id}
                          className="admin-data-row admin-data-row--records admin-data-row--link"
                          href={getPersonHref('referee', official.person_id, copy.locale)}
                          aria-label={isZh ? `打开人物档案: ${official.name_zh || official.display_name}` : `Open person: ${official.display_name}`}
                        >
                          <span>
                            <b>{official.name_zh || official.display_name}</b>
                            <small className="admin-muted">{official.display_name}</small>
                          </span>
                          <span>{roleLabel(official.role, copy.locale)}</span>
                          <span>{isZh ? (official.country_name_zh || official.country_name_en || '—') : (official.country_name_en || official.country_name_zh || '—')}</span>
                        </a>
                      ))
                    : (peopleProfiles.visible as PersonProfile[]).map((profile) => (
                        <a
                          key={profile.person_id}
                          className="admin-data-row admin-data-row--records admin-data-row--link"
                          href={getPersonHref(peopleProfiles.kind, profile.person_id, copy.locale)}
                          aria-label={isZh ? `打开人物档案: ${profile.name_zh || profile.display_name}` : `Open person: ${profile.display_name}`}
                        >
                          <span>
                            <b>{profile.name_zh || profile.display_name}</b>
                            <small className="admin-muted">{profile.display_name}</small>
                          </span>
                          <span>{profile.primary_team_name ? formatTeamName(profile.primary_team_name, copy.locale) : '—'}</span>
                          <span>{isZh ? (profile.country_name_zh || profile.country_name_en || '—') : (profile.country_name_en || profile.country_name_zh || '—')}</span>
                        </a>
                      ))}
                </div>
              </article>
            </section>
          ) : null}

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

          {(activeTab === 'predictions' || activeTab === 'favorites') ? (
            <section className="stats-section">
              <div className="admin-section-head">
                <h2>{activeTab === 'favorites' ? (isZh ? '收藏记录' : 'Favorite Records') : (isZh ? '预测记录' : 'Prediction Records')}</h2>
                <span>{isZh ? '用户互动明细' : 'User engagement records'}</span>
              </div>
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
              <details className="admin-record-panel" open={activeTab === 'favorites'}>
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
              <details className="admin-record-panel" open={activeTab === 'predictions'}>
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
              <div className="admin-section-head">
                <h2>{isZh ? '权限设置' : 'Permissions'}</h2>
                <span>{isZh ? '页面默认权限 + 用户单独权限' : 'Default and per-user access'}</span>
              </div>
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

          {activeTab === 'settings' ? (
            <section className="stats-section">
              <div className="admin-section-head">
                <h2>{isZh ? '系统设置' : 'System Settings'}</h2>
                <span>{isZh ? '当前为运行状态面板' : 'Runtime status panel'}</span>
              </div>
              <article className="admin-panel">
                <div className="admin-panel__head"><h3>{isZh ? '数据与认证' : 'Data and auth'}</h3></div>
                <div className="admin-dashboard-grid admin-dashboard-grid--settings">
                  <article><h3>Supabase</h3><p><span>{isZh ? '认证状态' : 'Auth'}</span><b>{isZh ? '已配置' : 'Configured'}</b></p></article>
                  <article><h3>football-data-platform</h3><p><span>{isZh ? '数据源' : 'Data source'}</span><b>{isZh ? '运行时读取' : 'Runtime API'}</b></p></article>
                  <article><h3>GitHub Pages</h3><p><span>{isZh ? '部署' : 'Deploy'}</span><b>{isZh ? '工作流发布' : 'Workflow'}</b></p></article>
                </div>
              </article>
            </section>
          ) : null}
        </main>
      </div>
    </section>
  );
}
