import { useEffect, useState, type CSSProperties } from 'react';
import { formatMatchupLabel, formatVenueName } from '../i18n/formatters';
import { localizePath, type Locale } from '../i18n/content';
import type { HeroSlideData } from '../data/home';
import { publicAssetPath } from '../utils/publicAssets';

interface HomeHeroCarouselProps {
  slides: HeroSlideData[];
  locale: Locale;
}

const TOURNAMENT_PROMO_VIDEO_URL =
  publicAssetPath('/worldcup-assets/2026worldcup.mp4');

const heroAssetStyles = {
  '--home-promo-artwork': `image-set(url("${publicAssetPath('/worldcup-assets/optimized/home-promo-hero.webp')}") type("image/webp"), url("${publicAssetPath('/worldcup-assets/optimized/home-promo-hero-small.jpg')}") type("image/jpeg"))`,
  '--home-opening-artwork': `url("${publicAssetPath('/worldcup-assets/optimized/opening-match-poster-v2.jpg')}")`
} as CSSProperties;

export function HomeHeroCarousel({ slides, locale }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPromoPlaying, setIsPromoPlaying] = useState(false);
  const promoIndex = slides.findIndex((slide) => slide.type === 'promo');

  useEffect(() => {
    if (slides.length <= 1 || isPromoPlaying) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isPromoPlaying, slides.length]);

  function handleProgressSelect(index: number): void {
    setActiveIndex(index);
    if (index !== promoIndex) {
      setIsPromoPlaying(false);
    }
  }

  function handlePromoPlay(): void {
    if (promoIndex >= 0) {
      setActiveIndex(promoIndex);
    }
    setIsPromoPlaying(true);
  }

  return (
    <section className="home-hero" style={heroAssetStyles}>
      <div
        className="home-hero__track"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {slides.map((slide) => {
          const matchupLabel = slide.matchupLabel
            ? formatMatchupLabel(slide.matchupLabel, locale)
            : null;
          const isPromo = slide.type === 'promo';
          const isOpening = slide.accent === 'opening';

          return (
            <article
              key={slide.id}
              className={`home-hero__slide home-hero__slide--${slide.accent ?? 'default'}`}
            >
              <div className="home-hero__media" aria-hidden="true" />
              <div className="home-hero__visual" aria-hidden="true" />
              {!isOpening ? (
                <div className="home-hero__content">
                  <p className="home-hero__eyebrow">{slide.eyebrow}</p>
                  <h1>{slide.title}</h1>
                  {matchupLabel ? <p className="home-hero__matchup">{matchupLabel}</p> : null}
                  <p className="home-hero__description">{slide.description}</p>
                  {slide.dateLabel ? <p className="home-hero__meta">{slide.dateLabel}</p> : null}
                  {slide.venueLabel ? (
                    <p className="home-hero__meta">{formatVenueName(slide.venueLabel, locale)}</p>
                  ) : null}
                </div>
              ) : null}

              {isPromo ? (
                <>
                  {isPromoPlaying ? (
                    <video
                      className="home-hero__video home-hero__video--contain"
                      src={TOURNAMENT_PROMO_VIDEO_URL}
                      aria-label={locale === 'zh' ? '官方宣传片播放器' : 'official trailer player'}
                      controls
                      autoPlay
                      muted
                      playsInline
                      onEnded={() => setIsPromoPlaying(false)}
                    />
                  ) : null}
                  {!isPromoPlaying ? (
                    <button
                      type="button"
                      className="home-hero__hitarea"
                      aria-label={locale === 'zh' ? '打开官方宣传片' : 'open official trailer'}
                      onClick={handlePromoPlay}
                    />
                  ) : null}
                </>
              ) : (
                <a
                  className="home-hero__hitarea"
                  href={localizePath(slide.href, locale)}
                  aria-label={locale === 'zh' ? '进入揭幕战详情页' : 'open opening match detail page'}
                />
              )}
            </article>
          );
        })}
      </div>
      <div
        className="home-hero__progress"
        role="tablist"
        aria-label={locale === 'zh' ? '首页主视觉切换' : 'homepage hero carousel'}
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={locale === 'zh' ? `切换到第 ${index + 1} 页` : `switch to slide ${index + 1}`}
            aria-pressed={index === activeIndex}
            className={index === activeIndex ? 'is-active' : undefined}
            onClick={() => handleProgressSelect(index)}
          />
        ))}
      </div>
    </section>
  );
}
