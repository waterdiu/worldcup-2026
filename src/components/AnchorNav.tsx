import type { AppCopy } from '../i18n/content';

interface AnchorNavProps {
  copy: AppCopy;
}

export function AnchorNav({ copy }: AnchorNavProps) {
  const links = [
    { href: '#top', label: copy.nav.top },
    { href: '#qualifiers', label: copy.nav.qualifiers },
    { href: '#cities', label: copy.nav.cities },
    { href: '#fixtures', label: copy.nav.fixtures },
    { href: '#format', label: copy.nav.format },
    { href: '#groups', label: copy.nav.groups },
    { href: '#knockout', label: copy.nav.bracket },
    { href: '#prediction', label: copy.nav.predict }
  ];

  return (
    <nav aria-label="Section navigation" className="anchor-nav">
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
