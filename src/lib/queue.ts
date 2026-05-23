import { v4 as uuidv4 } from 'uuid';
import type { DownloadJob, DownloadRequest } from '../types';
import { logger } from '../logger';
import { downloadFromSeerr } from '../sources/seerr';
import { downloadFromEmbyJellyfin } from '../sources/emby-jellyfin';
import { downloadFromPlex } from '../sources/plex';
import { getEpisodePath, getMoviePath, writeFile } from './file-placer';
import {
  getSettings,
  isInScheduleWindow,
} from '../settings';

class DownloadQueue {
  private jobs = new Map<string, DownloadJob>();
  private queue: string[] = [];
  private activeCount = 0;
  private pausedJobIds = new Set<string>();
  private globalPaused = false;
  private cancelTokens = new Map<string, AbortController>();

  public enqueue(request: DownloadRequest): DownloadJob {
    const job: DownloadJob = {
      id: uuidv4(),
      request,
      status: 'queued',
      progress: 0,
      bytesDownloaded: 0,
      totalBytes: 0,
      createdAt: new Date(),
    };
    this.jobs.set(job.id, job);
    this.queue.push(job.id);

    logger.info(
      `Queued: ${request.destination.title} (${request.source.type})`,
      'Queue'
    );

    this.processQueue();
    return job;
  }

  public getStatus(id: string): DownloadJob | null {
    return this.jobs.get(id) ?? null;
  }

  public getActiveCount(): number {
    return this.activeCount;
  }

  public listJobs(): DownloadJob[] {
    return Array.from(this.jobs.values());
  }

  public pauseJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.status === 'downloading') {
      const token = this.cancelTokens.get(id);
      if (token) token.abort();
    }
    this.pausedJobIds.add(id);
    if (job.status === 'queued' || job.status === 'downloading') {
      job.status = 'queued';
    }
    logger.info(`Paused: ${job.request.destination.title}`, 'Queue');
    return true;
  }

  public resumeJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    this.pausedJobIds.delete(id);
    this.cancelTokens.delete(id);
    if (job.status === 'queued' && !this.queue.includes(id)) {
      this.queue.push(id);
    }
    logger.info(`Resumed: ${job.request.destination.title}`, 'Queue');
    this.processQueue();
    return true;
  }

  public cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;
    const token = this.cancelTokens.get(id);
    if (token) token.abort();
    this.queue = this.queue.filter((j) => j !== id);
    this.pausedJobIds.delete(id);
    this.cancelTokens.delete(id);
    if (job.status === 'downloading') {
      this.activeCount--;
    }
    job.status = 'failed';
    job.error = 'Cancelled by user';
    logger.info(`Cancelled: ${job.request.destination.title}`, 'Queue');
    return true;
  }

  public clearCompleted(): number {
    let count = 0;
    for (const [id, job] of this.jobs) {
      if (job.status === 'complete' || job.status === 'failed') {
        this.jobs.delete(id);
        this.queue = this.queue.filter((j) => j !== id);
        this.pausedJobIds.delete(id);
        this.cancelTokens.delete(id);
        count++;
      }
    }
    return count;
  }

  public setGlobalPaused(paused: boolean): void {
    this.globalPaused = paused;
    if (!paused) {
      this.processQueue();
    }
  }

  public isGlobalPaused(): boolean {
    return this.globalPaused;
  }

  private async processQueue(): Promise<void> {
    const settings = getSettings();

    if (!isInScheduleWindow(settings.schedules)) {
      return;
    }

    while (
      !this.globalPaused &&
      this.activeCount < settings.maxConcurrentDownloads &&
      this.queue.length > 0
    ) {
      const id = this.queue.shift();
      if (!id) break;
      if (this.pausedJobIds.has(id)) continue;

      const job = this.jobs.get(id);
      if (!job) continue;
      if (job.status === 'complete' || job.status === 'failed') continue;

      this.activeCount++;
      this.processJob(id).finally(() => {
        this.activeCount--;
        this.processQueue();
      });
    }
  }

  public triggerProcess(): void {
    this.processQueue();
  }

  private async processJob(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;

    if (this.pausedJobIds.has(id)) {
      this.activeCount--;
      return;
    }

    job.status = 'downloading';

    logger.info(
      `Downloading: ${job.request.destination.title} from ${job.request.source.type}`,
      'Queue'
    );

    const cancelController = new AbortController();
    this.cancelTokens.set(id, cancelController);

    try {
      const { request } = job;

      const downloadFn = {
        seerr: downloadFromSeerr,
        plex: downloadFromPlex,
        emby: downloadFromEmbyJellyfin,
        jellyfin: downloadFromEmbyJellyfin,
      }[request.source.type];

      if (!downloadFn) {
        throw new Error(`Unsupported source type: ${request.source.type}`);
      }

      const { stream, fileName, contentLength } = await downloadFn(request);

      if (cancelController.signal.aborted) return;

      job.totalBytes = contentLength;

      let outputPath: string;
      if (request.destination.mediaType === 'tv') {
        outputPath = getEpisodePath(
          request.destination.title,
          request.destination.seasonNumber ?? 1,
          request.destination.episodeNumbers?.[0] ?? 1,
          fileName.split('.').pop() ?? 'mkv',
          request.destination.libraryPath
        );
      } else {
        outputPath = `${getMoviePath(
          request.destination.title,
          request.destination.year,
          request.destination.libraryPath
        )}/${fileName}`;
      }

      await writeFile(outputPath, stream);

      if (cancelController.signal.aborted) return;

      job.status = 'complete';
      job.outputPath = outputPath;
      job.progress = 100;
      job.bytesDownloaded = job.totalBytes;

      logger.info(`Download complete: ${outputPath}`, 'Queue');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      job.status = 'failed';
      job.error = (e as Error).message;

      logger.error(
        `Download failed: ${job.request.destination.title} — ${job.error}`,
        'Queue'
      );
    } finally {
      this.cancelTokens.delete(id);
    }
  }
}

export const downloadQueue = new DownloadQueue();
