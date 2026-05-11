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
  const pendingUsers = dashboard.profiles.filter((profile) => (profile.status ?? 'pending') === 'pending');
  const activeUsers = dashboard.profiles.filter((profile) => (profile.status ?? 'pending') === 'active');
  const roleByUserId = new Map(dashboard.roles.map((role) => [role.user_id, role.role]));

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
          <span>{isZh ? '用户管理' : 'User Management'}</span>
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
          <span>{isZh ? '用户管理' : 'User Management'}</span>
          <h1>{isZh ? '正在检查权限' : 'Checking Access'}</h1>
        </article>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="section admin-page">
        <article className="admin-hero">
          <span>{isZh ? '用户管理' : 'User Management'}</span>
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
        <span>{isZh ? '用户管理' : 'User Management'}</span>
        <h1>{isZh ? '用户管理' : 'User Management'}</h1>
        <p>
          {isZh
            ? '查看用户、审批注册、调整角色和页面访问权限。默认用户可以访问公开页面，敏感数据由 Supabase RLS 控制。'
            : 'Review users, approve registrations, adjust roles, and manage page access. Public pages remain open by default; sensitive data is protected by Supabase RLS.'}
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
        <div><span>{isZh ? '总用户' : 'Users'}</span><strong>{dashboard.profiles.length}</strong></div>
        <div><span>{isZh ? '待审批' : 'Pending'}</span><strong>{pendingUsers.length}</strong></div>
        <div><span>{isZh ? '已启用' : 'Active'}</span><strong>{activeUsers.length}</strong></div>
        <div><span>{isZh ? '预测总数' : 'Predictions'}</span><strong>{dashboard.predictions.length}</strong></div>
      </div>

      <article className="admin-card">
        <h2>{isZh ? '注册审批' : 'Registration Review'}</h2>
        {pendingUsers.length > 0 ? (
          <div className="admin-user-list">
            {pendingUsers.map((profile) => (
              <div className="admin-user-card" key={profile.id}>
                <div>
                  <strong>{profile.display_name || profile.email || profile.id}</strong>
                  <span>{profile.email || profile.id}</span>
                </div>
                <button type="button" onClick={() => dashboard.saveProfile({ ...profile, status: 'active' })}>
                  {isZh ? '通过' : 'Approve'}
                </button>
                <button type="button" className="admin-button--secondary" onClick={() => dashboard.saveProfile({ ...profile, status: 'rejected' })}>
                  {isZh ? '拒绝' : 'Reject'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>{isZh ? '当前没有待审批用户。' : 'No users are pending review.'}</p>
        )}
      </article>

      <article className="admin-card">
        <h2>{isZh ? '用户列表与权限' : 'Users and Access'}</h2>
        <div className="admin-table">
          <div className="admin-table__row admin-table__row--head admin-table__row--users">
            <span>{isZh ? '用户' : 'User'}</span>
            <span>{isZh ? '状态' : 'Status'}</span>
            <span>{isZh ? '角色' : 'Role'}</span>
            <span>{isZh ? '操作' : 'Actions'}</span>
          </div>
          {dashboard.profiles.map((profile) => (
            <div className="admin-table__row admin-table__row--users" key={profile.id}>
              <span title={profile.id}>{profile.display_name || profile.email || profile.id}<small>{profile.email || formatDate(profile.created_at)}</small></span>
              <select
                value={profile.status ?? 'pending'}
                onChange={(event) => dashboard.saveProfile({ ...profile, status: event.target.value })}
              >
                <option value="pending">{isZh ? '待审批' : 'Pending'}</option>
                <option value="active">{isZh ? '已启用' : 'Active'}</option>
                <option value="disabled">{isZh ? '已禁用' : 'Disabled'}</option>
                <option value="rejected">{isZh ? '已拒绝' : 'Rejected'}</option>
              </select>
              <select
                value={roleByUserId.get(profile.id) ?? 'user'}
                onChange={(event) => dashboard.saveRole(profile.id, event.target.value === 'admin' ? 'admin' : null)}
              >
                <option value="user">{isZh ? '普通用户' : 'User'}</option>
                <option value="admin">{isZh ? '管理员' : 'Admin'}</option>
              </select>
              <button type="button" className="admin-button--secondary" onClick={() => dashboard.saveProfile({ ...profile, status: 'disabled' })}>
                {isZh ? '禁用' : 'Disable'}
              </button>
            </div>
          ))}
        </div>
      </article>

      <article className="admin-card">
        <h2>{isZh ? '用户相关统计' : 'User Statistics'}</h2>
        <div className="admin-metric-grid">
          <div><span>{isZh ? '收藏总数' : 'Favorites'}</span><strong>{dashboard.favorites.length}</strong></div>
          <div><span>{isZh ? '预测总数' : 'Predictions'}</span><strong>{dashboard.predictions.length}</strong></div>
          <div><span>{isZh ? '页面规则' : 'Page rules'}</span><strong>{dashboard.pagePermissions.length}</strong></div>
          <div><span>{isZh ? '用户权限' : 'User rules'}</span><strong>{dashboard.userPagePermissions.length}</strong></div>
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
        <h2>{isZh ? '默认页面访问权限' : 'Default Page Access'}</h2>
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

      <article className="admin-card">
        <h2>{isZh ? '单用户页面权限审批' : 'Per-user Page Access Review'}</h2>
        <p>{isZh ? '默认用户可以访问全部公开页面；这里用于给某个用户单独禁止页面，或标记需要审批。' : 'Users can access public pages by default; use this section to deny a page for a specific user or mark it for review.'}</p>
        <div className="admin-user-list">
          {dashboard.profiles.map((profile) => (
            <div className="admin-user-permission-card" key={profile.id}>
              <strong>{profile.display_name || profile.email || profile.id}</strong>
              <div className="admin-permission-grid">
                {dashboard.pagePermissions.map((permission) => {
                  const existing = dashboard.userPagePermissions.find((item) => item.user_id === profile.id && item.path === permission.path);
                  return (
                    <label key={permission.path}>
                      <input
                        type="checkbox"
                        checked={existing?.can_access ?? true}
                        onChange={(event) =>
                          dashboard.saveUserPagePermission({
                            user_id: profile.id,
                            path: permission.path,
                            can_access: event.target.checked,
                            requires_approval: existing?.requires_approval ?? false
                          })
                        }
                      />
                      {permission.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
