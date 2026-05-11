import { useAuth } from '../hooks/useAuth';
import { useFavorite, type FavoriteTargetType } from '../hooks/useFavorite';
import type { Locale } from '../i18n/content';

interface FavoriteButtonProps {
  targetType: FavoriteTargetType;
  targetId: string;
  locale: Locale;
  label?: string;
}

export function FavoriteButton({ targetType, targetId, locale, label }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { favorite, loading, toggleFavorite } = useFavorite(user, targetType, targetId);
  const targetLabel =
    label ?? (targetType === 'match' ? (locale === 'zh' ? '比赛' : 'match') : targetType);

  if (!user) {
    return (
      <button type="button" className="favorite-button" disabled>
        {locale === 'zh' ? `登录后收藏${targetLabel}` : `Sign in to save ${targetLabel}`}
      </button>
    );
  }

  return (
    <button type="button" className="favorite-button" disabled={loading} onClick={toggleFavorite}>
      {favorite
        ? locale === 'zh'
          ? `已收藏${targetLabel}`
          : `Saved ${targetLabel}`
        : locale === 'zh'
          ? `收藏${targetLabel}`
          : `Save ${targetLabel}`}
    </button>
  );
}
