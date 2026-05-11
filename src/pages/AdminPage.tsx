import { useAuth } from '../hooks/useAuth';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { type AppCopy } from '../i18n/content';
import { getAuthDisplayName, isSupabaseConfigured } from '../lib/supabase';

interface AdminPageProps {
  copy: AppCopy;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export function AdminPage({ copy }: AdminPageProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus(user);
  const dashboard = useAdminDashboard(Boolean(user && isAdmin));
  const isZh = copy.locale === 'zh';

  if (!isSupabaseConfigured) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理员' : 'Admin'}</span>
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
          <span>{isZh ? '管理员' : 'Admin'}</span>
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
          <span>{isZh ? '管理员' : 'Admin'}</span>
          <h1>{isZh ? '正在检查权限' : 'Checking Access'}</h1>
        </article>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '管理员' : 'Admin'}</span>
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
    <section className="section admin-page">
      <article className="admin-hero">
        <span>{isZh ? '管理员' : 'Admin'}</span>
        <h1>{isZh ? '管理后台' : 'Admin Console'}</h1>
        <p>
          {isZh
            ? '管理账号、收藏、预测和前端页面访问配置。数据安全由 Supabase RLS 控制。'
            : 'Manage accounts, favorites, predictions, and frontend page-access settings. Data security is enforced by Supabase RLS.'}
        </p>
        <button type="button" onClick={dashboard.refresh} disabled={dashboard.loading}>
          {dashboard.loading ? (isZh ? '刷新中...' : 'Refreshing...') : isZh ? '刷新数据' : 'Refresh data'}
        </button>
      </article>

      {dashboard.error ? (
        <article className="admin-card admin-card--warning">
          <h2>{isZh ? '后台数据暂不可用' : 'Admin data is unavailable'}</h2>
          <p>{dashboard.error}</p>
          <p>
            {isZh
              ? '通常是还没有执行 docs/supabase-user-schema.sql 里的管理员扩展 SQL，或当前账号没有 admin 角色。'
              : 'Usually this means the admin SQL in docs/supabase-user-schema.sql has not been run, or the current user lacks the admin role.'}
          </p>
        </article>
      ) : null}

      <div className="admin-metric-grid">
        <div><span>{isZh ? '账号' : 'Accounts'}</span><strong>{dashboard.profiles.length}</strong></div>
        <div><span>{isZh ? '收藏' : 'Favorites'}</span><strong>{dashboard.favorites.length}</strong></div>
        <div><span>{isZh ? '预测' : 'Predictions'}</span><strong>{dashboard.predictions.length}</strong></div>
        <div><span>{isZh ? '页面权限' : 'Page rules'}</span><strong>{dashboard.pagePermissions.length}</strong></div>
      </div>

      <article className="admin-card">
        <h2>{isZh ? '账号管理' : 'Accounts'}</h2>
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head">
            <span>{isZh ? '用户' : 'User'}</span>
            <span>Email</span>
            <span>{isZh ? '创建时间' : 'Created'}</span>
          </div>
          {dashboard.profiles.map((profile) => (
            <div className="admin-table__row" key={profile.id}>
              <span>{profile.display_name || profile.id}</span>
              <span>{profile.email || '-'}</span>
              <span>{formatDate(profile.created_at)}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <h2>{isZh ? '收藏记录' : 'Favorites'}</h2>
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head">
            <span>{isZh ? '用户 ID' : 'User ID'}</span>
            <span>{isZh ? '对象' : 'Target'}</span>
            <span>{isZh ? '时间' : 'Created'}</span>
          </div>
          {dashboard.favorites.map((favorite) => (
            <div className="admin-table__row" key={favorite.id}>
              <span>{favorite.user_id}</span>
              <span>{favorite.target_type}: {favorite.target_id}</span>
              <span>{formatDate(favorite.created_at)}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <h2>{isZh ? '预测记录' : 'Predictions'}</h2>
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head">
            <span>{isZh ? '用户 ID' : 'User ID'}</span>
            <span>{isZh ? '比赛' : 'Match'}</span>
            <span>{isZh ? '预测' : 'Pick'}</span>
          </div>
          {dashboard.predictions.map((prediction) => (
            <div className="admin-table__row" key={prediction.id}>
              <span>{prediction.user_id}</span>
              <span>{isZh ? `比赛 ${prediction.match_id}` : `Match ${prediction.match_id}`}</span>
              <span>{prediction.winner} · {prediction.home_score}-{prediction.away_score}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <h2>{isZh ? '页面访问权限' : 'Page Access'}</h2>
        <p>
          {isZh
            ? '这是前端路由权限配置。GitHub Pages 是静态托管，不能真正隐藏公开静态文件；敏感数据仍必须依赖 Supabase RLS。'
            : 'These are frontend route rules. GitHub Pages is static hosting, so public files cannot be truly hidden; sensitive data must remain protected by Supabase RLS.'}
        </p>
        <div className="admin-permission-list">
          {dashboard.pagePermissions.map((permission) => (
            <div className="admin-permission-row" key={permission.path}>
              <div>
                <strong>{permission.label}</strong>
                <span>{permission.path}</span>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={permission.require_login}
                  onChange={(event) => dashboard.savePagePermission({ ...permission, require_login: event.target.checked })}
                />
                {isZh ? '需要登录' : 'Login required'}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={permission.admin_only}
                  onChange={(event) => dashboard.savePagePermission({ ...permission, admin_only: event.target.checked })}
                />
                {isZh ? '仅管理员' : 'Admin only'}
              </label>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
