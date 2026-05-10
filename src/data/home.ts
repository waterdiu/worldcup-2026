import type { GroupFixtureData } from '../types/tournament';
import type { Locale } from '../i18n/content';
import { groupFixtures } from './groupFixtures';

export interface HeroSlideData {
  id: string;
  type: 'promo' | 'match';
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  dateLabel?: string;
  venueLabel?: string;
  matchupLabel?: string;
  accent?: string;
}

export interface HomeMetricCardData {
  value: string;
  label: string;
  href: string;
  linkLabel: string;
}

const PROMO_VIDEO_URL = 'https://www.fifa.com/en/videos';

const PRE_OPENING_SLIDES: Record<Locale, HeroSlideData[]> = {
  en: [
    {
      id: 'promo',
      type: 'promo',
      eyebrow: 'Official Content',
      title: 'World Cup 2026 Official Trailer',
      description:
        'Before kickoff, the homepage keeps the tournament trailer and opening match together in one cinematic entry point.',
      ctaLabel: 'Watch Official Trailer',
      href: PROMO_VIDEO_URL,
      accent: 'promo'
    },
    {
      id: 'opening-match',
      type: 'match',
      eyebrow: 'Opening Match',
      title: 'Opening Match',
      description:
        'The opening match poster leads directly into the standalone match detail page.',
      ctaLabel: 'Open Match Detail',
      href: '/matches/1',
      dateLabel: '11 June 2026',
      venueLabel: 'Mexico City Stadium',
      matchupLabel: 'Mexico vs South Africa',
      accent: 'opening'
    }
  ],
  zh: [
    {
      id: 'promo',
      type: 'promo',
      eyebrow: '官方内容',
      title: '2026 世界杯 · 官方宣传片',
      description: '开幕前首页只保留宣传页和揭幕战页，先把世界杯的氛围和入口收在同一个主视觉区里。',
      ctaLabel: '观看官方宣传片',
      href: PROMO_VIDEO_URL,
      accent: 'promo'
    },
    {
      id: 'opening-match',
      type: 'match',
      eyebrow: '揭幕战',
      title: '揭幕战',
      description: '球场海报位会优先展示揭幕战，点击后进入这场比赛的独立详情页。',
      ctaLabel: '进入揭幕战详情',
      href: '/matches/1',
      dateLabel: '2026 年 6 月 11 日',
      venueLabel: 'Mexico City Stadium',
      matchupLabel: 'Mexico vs South Africa',
      accent: 'opening'
    }
  ]
};

function toIsoDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function formatChineseDate(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

function formatEnglishDate(date: Date): string {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function buildNextDaySlides(
  fixtures: GroupFixtureData[],
  referenceDate: Date,
  locale: Locale
): HeroSlideData[] {
  const nextDay = new Date(referenceDate);
  nextDay.setDate(referenceDate.getDate() + 1);
  const nextDayIso = toIsoDate(nextDay.toISOString());

  const slides = fixtures
    .filter((fixture) => toIsoDate(new Date(fixture.dateLabel).toISOString()) === nextDayIso)
    .map((fixture) => ({
      id: `fixture-${fixture.id}`,
      type: 'match' as const,
      eyebrow: locale === 'zh' ? '次日比赛' : 'Next Day Matches',
      title: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      description:
        locale === 'zh'
          ? '比赛正式开始后，首页主视觉会切换成第二天全部比赛的入口海报。'
          : 'After kickoff, the hero switches to entry posters for the next day of matches.',
      ctaLabel: locale === 'zh' ? '进入比赛详情' : 'Open Match Detail',
      href: `/matches/${fixture.id}`,
      dateLabel:
        locale === 'zh'
          ? formatChineseDate(new Date(fixture.dateLabel))
          : formatEnglishDate(new Date(fixture.dateLabel)),
      venueLabel: fixture.venue,
      matchupLabel: `${fixture.homeTeam} vs ${fixture.awayTeam}`,
      accent: 'next-day'
    }));

  return slides.length > 0 ? slides : PRE_OPENING_SLIDES[locale];
}

export function getHomepageHeroSlides(
  now: Date = new Date(),
  locale: Locale = 'en'
): HeroSlideData[] {
  const tournamentStart = new Date('2026-06-11T00:00:00');
  if (now < tournamentStart) {
    return PRE_OPENING_SLIDES[locale];
  }

  return buildNextDaySlides(groupFixtures, now, locale);
}

export const homeMetricCards: HomeMetricCardData[] = [
  { value: '12', label: '小组', href: '/groups', linkLabel: '查看 12 个小组详情' },
  { value: '48', label: '参赛队', href: '/teams', linkLabel: '查看 48 支参赛队详情' },
  { value: '104', label: '比赛', href: '/matches', linkLabel: '查看 104 场比赛详情' },
  { value: '16', label: '主办城市', href: '/cities', linkLabel: '查看 16 个主办城市详情' }
];
