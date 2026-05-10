import type { HostCityDetail } from './hostCityDetails';

export const HOST_COUNTRY_NAMES = new Set(['Canada', 'Mexico', 'United States']);

export interface HostCountryFeature {
  properties: {
    name?: string;
    name_long?: string;
  };
}

export interface GeoJsonFeatureCollection<TFeature extends HostCountryFeature = HostCountryFeature> {
  type: 'FeatureCollection';
  features: TFeature[];
}

export interface HostCityScatterDatum {
  name: string;
  value: [number, number];
  city: HostCityDetail;
}

export function isHostCountryFeature(feature: HostCountryFeature): boolean {
  const name = feature.properties.name_long ?? feature.properties.name;
  return Boolean(name && HOST_COUNTRY_NAMES.has(name));
}

export function filterHostCountries<TFeature extends HostCountryFeature>(
  geoJson: GeoJsonFeatureCollection<TFeature>
): GeoJsonFeatureCollection<TFeature> {
  return {
    ...geoJson,
    features: geoJson.features.filter(isHostCountryFeature)
  };
}

export function buildHostCityScatterData(cities: HostCityDetail[]): HostCityScatterDatum[] {
  return cities.map((city) => ({
    name: city.city,
    value: [city.longitude, city.latitude],
    city
  }));
}
