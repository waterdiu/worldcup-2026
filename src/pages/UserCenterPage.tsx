import { useAuth } from '../hooks/useAuth';
import { getAuthDisplayName, isSupabaseConfigured } from '../lib/supabase';
import type { AppCopy } from '../i18n/content';

interface UserCenterPageProps {
  copy: AppCopy;
}

export function UserCenterPage({ copy }: UserCenterPageProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const signedIn = Boolean(user);

  return (
    <section className="section user-center-page">
      <div className="user-center-hero">
        <p className="section-header__eyebrow">
          {copy.locale === 'zh' ? '用户中心' : 'User Center'}
        </p>
        <h1>{copy.locale === 'zh' ? '我的世界杯' : 'My World Cup'}</h1>
        <p>
          {signedIn
            ? copy.locale === 'zh'
              ? `已登录：${getAuthDisplayName(user)}`
              : `Signed in as ${getAuthDisplayName(user)}`
            : copy.locale === 'zh'
              ? '登录后可以同步收藏和预测。第一版会先保存比赛收藏、球队关注和比分预测。'
              : 'Sign in to sync favorites and predictions. The first release stores match favorites, followed teams, and score picks.'}
        </p>
        <div className="user-auth-actions">
          {signedIn ? (
            <button type="button" onClick={signOut}>
              {copy.locale === 'zh' ? '退出登录' : 'Sign out'}
            </button>
          ) : (
            <button type="button" onClick={signInWithGoogle} disabled={loading || !isSupabaseConfigured}>
              {copy.locale === 'zh' ? '使用 Google 登录' : 'Sign in with Google'}
            </button>
          )}
          {!isSupabaseConfigured ? (
            <span>{copy.locale === 'zh' ? 'Supabase 尚未配置' : 'Supabase is not configured'}</span>
          ) : null}
        </div>
      </div>

      <div className="user-center-grid">
        <article className="user-center-card">
          <span>{copy.locale === 'zh' ? 'Favorites' : 'Favorites'}</span>
          <h2>{copy.locale === 'zh' ? '我的收藏' : 'My Favorites'}</h2>
          <p>
            {copy.locale === 'zh'
              ? '这里会汇总你收藏的比赛、球队和城市。'
              : 'This area will collect saved matches, teams, and cities.'}
          </p>
        </article>
        <article className="user-center-card">
          <span>{copy.locale === 'zh' ? 'Predictions' : 'Predictions'}</span>
          <h2>{copy.locale === 'zh' ? '我的预测' : 'My Predictions'}</h2>
          <p>
            {copy.locale === 'zh'
              ? '这里会展示你的胜负选择和比分预测。'
              : 'This area will show your winner picks and score predictions.'}
          </p>
        </article>
        <article className="user-center-card">
          <span>{copy.locale === 'zh' ? 'Next' : 'Next'}</span>
          <h2>{copy.locale === 'zh' ? '下一步' : 'Next Step'}</h2>
          <p>
            {copy.locale === 'zh'
              ? '数据库表建好后，就可以把收藏按钮和预测表单接入 Supabase。'
              : 'After the database tables are created, favorites and prediction forms can write to Supabase.'}
          </p>
        </article>
      </div>
    </section>
  );
}
