import { localizePath, type Locale } from '../i18n/content';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useAuth } from '../hooks/useAuth';

const links = [
  { href: '/', label: { en: 'Home', zh: '首页' } },
  { href: '/qualifiers', label: { en: 'Qualifiers', zh: '预选赛' } },
  { href: '/stats', label: { en: 'Stats', zh: '统计' } },
  { href: '/people', label: { en: 'People', zh: '人物' } },
  { href: '/me', label: { en: 'Me', zh: '我的' } }
];

interface PageNavProps {
  pathname: string;
  locale: Locale;
}

export function PageNav({ pathname, locale }: PageNavProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdminStatus(user);
  const hasCachedAdminStatus =
    typeof window !== 'undefined' && window.localStorage.getItem('worldcup2026:is-admin') === 'true';
  const visibleLinks = isAdmin || (authLoading && hasCachedAdminStatus)
    ? [...links, { href: '/admin', label: { en: 'Admin', zh: '管理' } }]
    : links;

  return (
    <nav aria-label="Page navigation" className="page-nav">
      <a className="page-nav__brand" href={localizePath('/', locale)} aria-label={locale === 'zh' ? '返回首页' : 'Back home'}>
        WC 2026<span>DATA</span>
      </a>
      <div className="page-nav__links">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <a
              key={link.href}
              href={localizePath(link.href, locale)}
              aria-current={isActive ? 'page' : undefined}
            >
              {link.label[locale]}
            </a>
          );
        })}
      </div>
      <div className="page-nav__meta">
        <span className="page-nav__dot" />
        <span>{locale === 'zh' ? '世界杯数据站' : 'World Cup Data'}</span>
      </div>
    </nav>
  );
}
