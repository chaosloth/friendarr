import { config } from './config';
import type { Webhook } from './types';

export interface ScheduleWindow {
  start: string;
  end: string;
}

export interface Schedule {
  days: number[];
  windows: ScheduleWindow[];
}

export interface AppSettings {
  maxConcurrentDownloads: number;
  maxBandwidth: number;
  schedules: Schedule[];
  webhooks: Webhook[];
  incompletePath: string;
  completedPath: string;
  moviePath: string;
  tvPath: string;
  testMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const settings: AppSettings = {
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  maxBandwidth: 0,
  schedules: [],
  webhooks: [],
  incompletePath: config.incompletePath,
  completedPath: config.completedPath,
  moviePath: '',
  tvPath: '',
  testMode: false,
  logLevel: config.debug ? 'debug' : 'info',
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
  if (partial.webhooks !== undefined) {
    settings.webhooks = partial.webhooks;
  }
  if (partial.incompletePath !== undefined) {
    settings.incompletePath = partial.incompletePath;
  }
  if (partial.completedPath !== undefined) {
    settings.completedPath = partial.completedPath;
  }
  if (partial.testMode !== undefined) {
    settings.testMode = partial.testMode;
  }
  if (partial.logLevel !== undefined) {
    settings.logLevel = partial.logLevel;
  }
  if (partial.moviePath !== undefined) {
    settings.moviePath = partial.moviePath;
  }
  if (partial.tvPath !== undefined) {
    settings.tvPath = partial.tvPath;
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
