export interface PosterPlacement {
  top: string;
  left: string;
  width: string;
  height?: string;
  rotate?: number;
  zIndex?: number;
}

// Exhibition-style poster layout for the /cities page.
// Four poster columns keep the map central while making the page feel full.
export const posterPlacements: Record<string, PosterPlacement> = {
  // Left side (2 columns x 4 rows)
  Vancouver: { left: '2.6%', top: '2.6%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Seattle: { left: '12.0%', top: '2.6%', width: '8.4%', height: '22.2%', zIndex: 4 },
  'San Francisco Bay Area': { left: '2.6%', top: '26.5%', width: '8.4%', height: '22.2%', zIndex: 4 },
  'Los Angeles': { left: '12.0%', top: '26.5%', width: '8.4%', height: '22.2%', zIndex: 4 },
  'Kansas City': { left: '2.6%', top: '50.4%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Guadalajara: { left: '12.0%', top: '50.4%', width: '8.4%', height: '22.2%', zIndex: 4 },
  'Mexico City': { left: '2.6%', top: '74.3%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Monterrey: { left: '12.0%', top: '74.3%', width: '8.4%', height: '22.2%', zIndex: 4 },

  // Right side (2 columns x 4 rows)
  Toronto: { left: '79.6%', top: '2.6%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Boston: { left: '89.0%', top: '2.6%', width: '8.4%', height: '22.2%', zIndex: 4 },
  'New York New Jersey': { left: '79.6%', top: '26.5%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Philadelphia: { left: '89.0%', top: '26.5%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Dallas: { left: '79.6%', top: '50.4%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Houston: { left: '89.0%', top: '50.4%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Atlanta: { left: '79.6%', top: '74.3%', width: '8.4%', height: '22.2%', zIndex: 4 },
  Miami: { left: '89.0%', top: '74.3%', width: '8.4%', height: '22.2%', zIndex: 4 }
};
