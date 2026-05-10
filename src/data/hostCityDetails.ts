export interface HostCityDetail {
  city: string;
  country: string;
  stadium: string;
  imageUrl: string;
  stadiumImageUrl: string;
  officialStadiumName: string;
  capacity: number;
  opened: number;
  roofLabel: string;
  latitude: number;
  longitude: number;
}

function cityPoster(filename: string): string {
  return `/worldcup-assets/cities-normalized/${filename}.png`;
}

function cityPhoto(filename: string): string {
  return `/worldcup-assets/cities/${filename}.jpg`;
}

function stadiumPhoto(filename: string): string {
  return `/worldcup-assets/stadiums/${filename}.jpg`;
}

function stadiumImage(filename: string): string {
  return `/worldcup-assets/stadiums/${filename}`;
}

export const hostCityDetails: HostCityDetail[] = [
  { city: 'Atlanta', country: '美国', stadium: '亚特兰大球场', imageUrl: cityPoster('atlanta'), stadiumImageUrl: stadiumPhoto('atlanta'), officialStadiumName: 'Mercedes-Benz Stadium', capacity: 75000, opened: 2017, roofLabel: '可伸缩屋顶', latitude: 33.7554, longitude: -84.4008 },
  { city: 'Boston', country: '美国', stadium: '波士顿球场', imageUrl: cityPoster('boston'), stadiumImageUrl: stadiumPhoto('boston'), officialStadiumName: 'Gillette Stadium', capacity: 65000, opened: 2002, roofLabel: '露天球场', latitude: 42.0909, longitude: -71.2643 },
  { city: 'Dallas', country: '美国', stadium: '达拉斯球场', imageUrl: cityPoster('dallas'), stadiumImageUrl: stadiumPhoto('dallas'), officialStadiumName: 'AT&T Stadium', capacity: 94000, opened: 2009, roofLabel: '可伸缩屋顶', latitude: 32.7473, longitude: -97.0945 },
  { city: 'Guadalajara', country: '墨西哥', stadium: '瓜达拉哈拉球场', imageUrl: cityPoster('guadalajara'), stadiumImageUrl: stadiumPhoto('guadalajara'), officialStadiumName: 'Estadio Akron', capacity: 48000, opened: 2010, roofLabel: '露天球场', latitude: 20.6817, longitude: -103.4626 },
  { city: 'Houston', country: '美国', stadium: '休斯敦球场', imageUrl: cityPoster('houston'), stadiumImageUrl: stadiumPhoto('houston'), officialStadiumName: 'NRG Stadium', capacity: 72000, opened: 2002, roofLabel: '可伸缩屋顶', latitude: 29.6847, longitude: -95.4107 },
  { city: 'Kansas City', country: '美国', stadium: '堪萨斯城球场', imageUrl: cityPoster('kansas'), stadiumImageUrl: stadiumPhoto('kansas'), officialStadiumName: 'Arrowhead Stadium', capacity: 73000, opened: 1972, roofLabel: '露天球场', latitude: 39.049, longitude: -94.484 },
  { city: 'Los Angeles', country: '美国', stadium: '洛杉矶球场', imageUrl: cityPoster('losangeles'), stadiumImageUrl: stadiumPhoto('losangeles'), officialStadiumName: 'SoFi Stadium', capacity: 70000, opened: 2020, roofLabel: '顶棚覆盖', latitude: 33.9535, longitude: -118.3392 },
  { city: 'Mexico City', country: '墨西哥', stadium: '墨西哥城球场', imageUrl: cityPoster('mexicocity'), stadiumImageUrl: stadiumPhoto('mexicocity'), officialStadiumName: 'Estadio Azteca', capacity: 83000, opened: 1966, roofLabel: '露天球场', latitude: 19.3029, longitude: -99.1505 },
  { city: 'Miami', country: '美国', stadium: '迈阿密球场', imageUrl: cityPoster('miami'), stadiumImageUrl: stadiumPhoto('miami'), officialStadiumName: 'Hard Rock Stadium', capacity: 65000, opened: 1987, roofLabel: '露天球场', latitude: 25.958, longitude: -80.2389 },
  { city: 'Monterrey', country: '墨西哥', stadium: '蒙特雷球场', imageUrl: cityPoster('monterrey'), stadiumImageUrl: stadiumPhoto('monterrey'), officialStadiumName: 'Estadio BBVA', capacity: 53500, opened: 2015, roofLabel: '露天球场', latitude: 25.6681, longitude: -100.2445 },
  { city: 'New York New Jersey', country: '美国', stadium: '纽约新泽西球场', imageUrl: cityPoster('newyork'), stadiumImageUrl: stadiumPhoto('newyork'), officialStadiumName: 'MetLife Stadium', capacity: 82500, opened: 2010, roofLabel: '露天球场', latitude: 40.8135, longitude: -74.0745 },
  { city: 'Philadelphia', country: '美国', stadium: '费城球场', imageUrl: cityPoster('philadelphia'), stadiumImageUrl: stadiumPhoto('philadelphia'), officialStadiumName: 'Lincoln Financial Field', capacity: 69000, opened: 2003, roofLabel: '露天球场', latitude: 39.9008, longitude: -75.1675 },
  { city: 'San Francisco Bay Area', country: '美国', stadium: '旧金山湾区球场', imageUrl: cityPoster('sanfrancisco'), stadiumImageUrl: stadiumImage('sanfrancisco.png'), officialStadiumName: "Levi's Stadium", capacity: 71000, opened: 2014, roofLabel: '露天球场', latitude: 37.403, longitude: -121.97 },
  { city: 'Seattle', country: '美国', stadium: '西雅图球场', imageUrl: cityPoster('seattle'), stadiumImageUrl: stadiumPhoto('seattle'), officialStadiumName: 'Lumen Field', capacity: 69000, opened: 2002, roofLabel: '露天球场', latitude: 47.5952, longitude: -122.3316 },
  { city: 'Toronto', country: '加拿大', stadium: '多伦多球场', imageUrl: cityPoster('toronto'), stadiumImageUrl: stadiumPhoto('toronto'), officialStadiumName: 'BMO Field', capacity: 45000, opened: 2007, roofLabel: '露天球场', latitude: 43.6332, longitude: -79.4186 },
  { city: 'Vancouver', country: '加拿大', stadium: '温哥华 BC Place 球场', imageUrl: cityPoster('vancouver'), stadiumImageUrl: stadiumPhoto('vancouver'), officialStadiumName: 'BC Place', capacity: 54000, opened: 1983, roofLabel: '可伸缩屋顶', latitude: 49.2767, longitude: -123.1119 }
];
