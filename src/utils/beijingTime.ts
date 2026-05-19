import type { AppCopy } from '../i18n/content';

type Locale = AppCopy['locale'];

function getBeijingParts(dateLabel: string, locale: Locale) {
  const date = new Date(dateLabel);
  const fmt = new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value])) as Record<string, string>;
}

export function formatBeijingKickoff(dateLabel: string, locale: Locale): string {
  const parts = getBeijingParts(dateLabel, locale);
  const yyyy = parts.year;
  const mm = parts.month;
  const dd = parts.day;
  const hh = parts.hour;
  const min = parts.minute;

  if (locale === 'zh') {
    return `${yyyy}年${Number(mm)}月${Number(dd)}日 ${hh}:${min}`;
  }

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

export function formatBeijingMonthDayKickoff(dateLabel: string, locale: Locale): string {
  const parts = getBeijingParts(dateLabel, locale);
  const mm = parts.month;
  const dd = parts.day;
  const hh = parts.hour;
  const min = parts.minute;

  if (locale === 'zh') {
    return `${Number(mm)}月${Number(dd)}日 ${hh}:${min}`;
  }

  return `${mm}-${dd} ${hh}:${min}`;
}

