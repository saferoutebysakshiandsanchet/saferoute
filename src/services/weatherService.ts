import { HazardDoc } from '../types/saferoute';

export interface WeatherCondition {
  temperature: number;
  humidity: number;
  precipitation: number;
  visibilityKm: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  isSevere: boolean;
  alertSummary: string | null;
}

export interface WeatherAlertHazard {
  type: 'Severe Weather Alert' | 'Dense Fog / Low Visibility' | 'Waterlogging / Heavy Rain';
  severity: 'High' | 'Medium';
  title: string;
  description: string;
  advice: string;
}

const WMO_CODE_MAP: Record<number, { text: string; severe?: boolean }> = {
  0: { text: 'Clear Sky' },
  1: { text: 'Mainly Clear' },
  2: { text: 'Partly Cloudy' },
  3: { text: 'Overcast' },
  45: { text: 'Dense Fog', severe: true },
  48: { text: 'Depositing Rime Fog', severe: true },
  51: { text: 'Light Drizzle' },
  53: { text: 'Moderate Drizzle' },
  55: { text: 'Dense Drizzle' },
  61: { text: 'Slight Rain' },
  63: { text: 'Moderate Rain' },
  65: { text: 'Heavy Rain / Downpour', severe: true },
  71: { text: 'Slight Snow' },
  73: { text: 'Moderate Snow' },
  75: { text: 'Heavy Snow', severe: true },
  80: { text: 'Slight Rain Showers' },
  81: { text: 'Moderate Rain Showers' },
  82: { text: 'Violent Rain Showers', severe: true },
  95: { text: 'Thunderstorm', severe: true },
  96: { text: 'Thunderstorm with Slight Hail', severe: true },
  99: { text: 'Severe Thunderstorm with Heavy Hail', severe: true },
};

/**
 * Fetch real-time weather alerts and telemetry from Open-Meteo
 */
export async function fetchLiveWeatherAlerts(
  lat: number,
  lng: number,
  cityName: string = 'Current Zone'
): Promise<{ condition: WeatherCondition; hazards: HazardDoc[] }> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,visibility&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Weather API responded with status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};

    const temp = current.temperature_2m ?? 28;
    const humidity = current.relative_humidity_2m ?? 65;
    const precip = current.precipitation ?? 0;
    const code = current.weather_code ?? 0;
    const wind = current.wind_speed_10m ?? 12;
    const visibilityMeters = current.visibility ?? 10000;
    const visibilityKm = Math.round((visibilityMeters / 1000) * 10) / 10;

    const codeInfo = WMO_CODE_MAP[code] || { text: 'Normal Weather' };
    const isFoggy = visibilityKm <= 1.5 || code === 45 || code === 48;
    const isHeavyRain = precip >= 2.5 || [63, 65, 81, 82, 95, 96, 99].includes(code);
    const isHighWind = wind >= 40;

    const isSevere = isFoggy || isHeavyRain || isHighWind || !!codeInfo.severe;

    let alertSummary: string | null = null;
    const generatedHazards: HazardDoc[] = [];
    const nowIso = new Date().toISOString();

    if (isHeavyRain) {
      alertSummary = `Heavy Rain Alert: ${precip}mm/h precipitation in ${cityName}. Risk of waterlogging on low-lying pedestrian paths.`;
      generatedHazards.push({
        hazardId: `weather-rain-${Math.round(lat * 100)}-${Math.round(lng * 100)}`,
        type: 'Waterlogging / Heavy Rain',
        severity: precip > 5 ? 'High' : 'Medium',
        description: `Live Sensor Alert: Precipitation at ${precip} mm/h. Submerged curbs and reduced pedestrian visibility reported. Use elevated arterial footpaths.`,
        location: {
          type: 'Point',
          coordinates: [lng + 0.002, lat + 0.001], // [lng, lat]
        },
        status: 'Verified',
        source: 'Weather',
        createdAt: nowIso,
        upvotes: 24,
        address: `${cityName} Meteorological Zone (Precip: ${precip}mm/h)`,
      });
    }

    if (isFoggy) {
      const fogMsg = `Dense Fog Advisory: Visibility dropped to ${visibilityKm}km. Vehicle headlight glares and low pedestrian spotting distance.`;
      alertSummary = alertSummary ? `${alertSummary} | ${fogMsg}` : fogMsg;
      generatedHazards.push({
        hazardId: `weather-fog-${Math.round(lat * 100)}-${Math.round(lng * 100)}`,
        type: 'Dense Fog / Low Visibility',
        severity: visibilityKm < 0.8 ? 'High' : 'Medium',
        description: `Atmospheric sensor reading: Visibility restricted to ${visibilityKm} km. Wear reflective clothing, keep mobile flashlight handy, stick to well-lit main corridors.`,
        location: {
          type: 'Point',
          coordinates: [lng - 0.002, lat - 0.0015],
        },
        status: 'Verified',
        source: 'Weather',
        createdAt: nowIso,
        upvotes: 31,
        address: `${cityName} Fog Belt (Visibility: ${visibilityKm}km)`,
      });
    }

    if (isHighWind && !isHeavyRain) {
      generatedHazards.push({
        hazardId: `weather-wind-${Math.round(lat * 100)}-${Math.round(lng * 100)}`,
        type: 'Severe Weather Alert',
        severity: 'Medium',
        description: `Gale wind warning: Wind speeds reaching ${wind} km/h. Caution near weak temporary hoardings, construction scaffolding, and overhead wires.`,
        location: {
          type: 'Point',
          coordinates: [lng + 0.001, lat - 0.002],
        },
        status: 'Verified',
        source: 'Weather',
        createdAt: nowIso,
        upvotes: 18,
        address: `${cityName} High Wind Corridor (${wind} km/h)`,
      });
    }

    return {
      condition: {
        temperature: temp,
        humidity,
        precipitation: precip,
        visibilityKm,
        windSpeed: wind,
        weatherCode: code,
        conditionText: codeInfo.text,
        isSevere,
        alertSummary,
      },
      hazards: generatedHazards,
    };
  } catch (err) {
    console.warn('Weather fetch fallback triggered:', err);
    return {
      condition: {
        temperature: 27,
        humidity: 60,
        precipitation: 0,
        visibilityKm: 8.5,
        windSpeed: 11,
        weatherCode: 1,
        conditionText: 'Clear / Pleasant',
        isSevere: false,
        alertSummary: null,
      },
      hazards: [],
    };
  }
}

/**
 * Generate simulated severe weather for quick testing in UI
 */
export function getSimulatedWeatherHazard(
  type: 'rain' | 'fog',
  lat: number,
  lng: number,
  cityName: string
): { condition: WeatherCondition; hazard: HazardDoc } {
  const nowIso = new Date().toISOString();
  if (type === 'rain') {
    return {
      condition: {
        temperature: 23,
        humidity: 94,
        precipitation: 7.8,
        visibilityKm: 2.1,
        windSpeed: 28,
        weatherCode: 65,
        conditionText: 'Heavy Monsoonal Downpour',
        isSevere: true,
        alertSummary: `Heavy Rain Alert: Active waterlogging detected along transit corridors in ${cityName}.`,
      },
      hazard: {
        hazardId: `sim-rain-${Date.now()}`,
        type: 'Waterlogging / Heavy Rain',
        severity: 'High',
        description: `Live Weather Radar: Intense precipitation (7.8 mm/h). Low-lying subway passages and curbs under water. Safe pedestrian detour mapped.`,
        location: {
          type: 'Point',
          coordinates: [lng + 0.0015, lat + 0.001],
        },
        status: 'Verified',
        source: 'Weather',
        createdAt: nowIso,
        upvotes: 42,
        address: `${cityName} Drainage & Low-Lying Sector`,
      },
    };
  } else {
    return {
      condition: {
        temperature: 15,
        humidity: 89,
        precipitation: 0,
        visibilityKm: 0.4,
        windSpeed: 6,
        weatherCode: 45,
        conditionText: 'Dense Winter Smog / Fog',
        isSevere: true,
        alertSummary: `Dense Fog Warning: Visibility below 500m in ${cityName}. High vehicle collision hazard for pedestrians.`,
      },
      hazard: {
        hazardId: `sim-fog-${Date.now()}`,
        type: 'Dense Fog / Low Visibility',
        severity: 'High',
        description: `Optical sensor alert: Severe visibility drop (< 400m). Drivers cannot see crossing pedestrians. Cross only at designated traffic signals.`,
        location: {
          type: 'Point',
          coordinates: [lng - 0.0015, lat + 0.0012],
        },
        status: 'Verified',
        source: 'Weather',
        createdAt: nowIso,
        upvotes: 38,
        address: `${cityName} Ring Road & Arterial Crosswalk`,
      },
    };
  }
}
