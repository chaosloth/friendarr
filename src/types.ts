export type DownloadStatus = 'queued' | 'downloading' | 'complete' | 'failed';

export type SourceType = 'seerr' | 'plex' | 'emby' | 'jellyfin';

export interface DownloadRequest {
  source: {
    type: SourceType;
    url: string;
    authToken?: string;
    deviceId?: string;
    mediaId?: string;
    ratingKey?: string;
  };
  destination: {
    libraryPath: string;
    mediaType: 'movie' | 'tv';
    title: string;
    year: number;
    tmdbId: number;
    seasonNumber?: number;
    episodeNumbers?: number[];
  };
  metadata: {
    nfo: boolean;
    poster: boolean;
    fanart: boolean;
  };
}

export interface DownloadJob {
  id: string;
  request: DownloadRequest;
  status: DownloadStatus;
  progress: number;
  bytesDownloaded: number;
  totalBytes: number;
  error?: string;
  outputPath?: string;
  createdAt?: Date;
}

export interface ApiKey {
  key: string;
  label: string;
  createdAt: Date;
}
