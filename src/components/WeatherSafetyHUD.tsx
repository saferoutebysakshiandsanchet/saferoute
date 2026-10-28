import React from 'react';
import { 
  CloudRain, 
  CloudFog, 
  Sun, 
  Wind, 
  RefreshCw, 
  AlertTriangle, 
  Eye, 
  Droplets,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { WeatherCondition } from '../services/weatherService';

interface WeatherSafetyHUDProps {
  weather: WeatherCondition | null;
  cityName: string;
  isLoading: boolean;
  onRefresh: () => void;
  onSimulateWeather: (type: 'rain' | 'fog') => void;
  weatherHazardsCount: number;
}

export const WeatherSafetyHUD: React.FC<WeatherSafetyHUDProps> = ({
  weather,
  cityName,
  isLoading,
  onRefresh,
  onSimulateWeather,
  weatherHazardsCount,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!weather) return null;

  const isRain = weather.precipitation > 0 || weather.weatherCode >= 50;
  const isFog = weather.visibilityKm < 2.0 || weather.weatherCode === 45 || weather.weatherCode === 48;

  const WeatherIcon = isRain 
    ? CloudRain 
    : isFog 
    ? CloudFog 
    : weather.windSpeed > 30 
    ? Wind 
    : Sun;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl p-3 text-xs text-white transition-all">
      {/* Primary Weather Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            weather.isSevere 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' 
              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
          }`}>
            <WeatherIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{weather.temperature}°C</span>
              <span className="text-slate-300 font-medium">{weather.conditionText}</span>
              {weather.isSevere && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> ALERT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>{cityName} Weather Grid</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" /> Vis: {weather.visibilityKm} km
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> Rain: {weather.precipitation} mm/h
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Live Weather"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Severe Weather Warning Banner */}
      {weather.alertSummary && (
        <div className="mt-2.5 p-2 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Local Alert: </span>
            {weather.alertSummary}
            {weatherHazardsCount > 0 && (
              <span className="block mt-0.5 text-amber-300 text-[10px]">
                Active on Map: {weatherHazardsCount} temporary weather hazards plotted on the navigation layer.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded Controls & Simulation */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-slate-300">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="block text-[10px] text-slate-400">Wind Speed</span>
              <span className="font-semibold text-white">{weather.windSpeed} km/h</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="block text-[10px] text-slate-400">Humidity</span>
              <span className="font-semibold text-white">{weather.humidity}%</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="block text-[10px] text-slate-400">Weather Hazards</span>
              <span className="font-semibold text-cyan-400">{weatherHazardsCount} Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Test Weather Scenarios:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onSimulateWeather('rain')}
                className="px-2 py-1 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-700/50 text-[10px] transition-colors"
              >
                ☔ Simulate Heavy Rain
              </button>
              <button
                onClick={() => onSimulateWeather('fog')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[10px] transition-colors"
              >
                🌫️ Simulate Dense Fog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
