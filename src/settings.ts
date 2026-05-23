import { config } from './config';

export interface ScheduleWindow {
  start: string;
  end: string;
}

export interface Schedule {
  days: number[];
  windows: ScheduleWindow[];
}

export interface SourceEndpoint {
  id: string;
  type: 'seerr' | 'plex' | 'emby' | 'jellyfin';
  url: string;
  authToken: string;
  label: string;
}

export interface AppSettings {
  maxConcurrentDownloads: number;
  maxBandwidth: number;
  schedules: Schedule[];
  sourceEndpoints: SourceEndpoint[];
}

const settings: AppSettings = {
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  maxBandwidth: 0,
  schedules: [],
  sourceEndpoints: [],
};

export function getSettings(): AppSettings {
  return settings;
}

export function updateSettings(partial: Partial<AppSettings>): AppSettings {
  if (partial.maxConcurrentDownloads !== undefined) {
    settings.maxConcurrentDownloads = partial.maxConcurrentDownloads;
  }
  if (partial.maxBandwidth !== undefined) {
    settings.maxBandwidth = partial.maxBandwidth;
  }
  if (partial.schedules !== undefined) {
    settings.schedules = partial.schedules;
  }
  if (partial.sourceEndpoints !== undefined) {
    settings.sourceEndpoints = partial.sourceEndpoints;
  }
  return settings;
}

export function isInScheduleWindow(schedules: Schedule[]): boolean {
  if (schedules.length === 0) return true;

  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const schedule of schedules) {
    if (!schedule.days.includes(day)) continue;
    for (const window of schedule.windows) {
      const [startH, startM] = window.start.split(':').map(Number);
      const [endH, endM] = window.end.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;

      if (end > start) {
        if (currentMinutes >= start && currentMinutes < end) return true;
      } else {
        if (currentMinutes >= start || currentMinutes < end) return true;
      }
    }
  }

  return false;
}
