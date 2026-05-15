import { HomeHeroCarousel } from '../components/HomeHeroCarousel';
import { HomeMetricPanel } from '../components/HomeMetricPanel';
import type { HeroSlideData } from '../data/home';
import type { Locale } from '../i18n/content';
import type { GroupCardData, GroupFixtureData } from '../types/tournament';

interface HomePageProps {
  slides: HeroSlideData[];
  groups: GroupCardData[];
  teams: string[];
  fixtures: GroupFixtureData[];
  hostCities: string[];
  locale: Locale;
}

export function HomePage({
  slides,
  groups,
  teams,
  fixtures,
  hostCities,
  locale
}: HomePageProps) {
  return (
    <section className="home-shell">
      <HomeHeroCarousel slides={slides} locale={locale} />
      <HomeMetricPanel
        groups={groups}
        teams={teams}
        fixtures={fixtures}
        hostCities={hostCities}
        locale={locale}
      />
    </section>
  );
}
