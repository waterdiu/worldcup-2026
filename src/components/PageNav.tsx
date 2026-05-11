import { localizePath, type Locale } from '../i18n/content';
import { useAdminStatus } from '../hooks/useAdminStatus';
import { useAuth } from '../hooks/useAuth';

const links = [
  { href: '/', label: { en: 'Home', zh: '首页' } },
  { href: '/qualifiers', label: { en: 'Qualifiers', zh: '预选赛' } },
  { href: '/stats', label: { en: 'Stats', zh: '统计' } },
  { href: '/me', label: { en: 'Me', zh: '我的' } }
];

interface PageNavProps {
  pathname: string;
  locale: Locale;
}

export function PageNav({ pathname, locale }: PageNavProps) {
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus(user);
  const visibleLinks = isAdmin
    ? [...links, { href: '/admin', label: { en: 'Admin', zh: '管理' } }]
    : links;

  return (
    <nav aria-label="Page navigation" className="page-nav">
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
    </nav>
  );
}
