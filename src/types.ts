export interface QueueItem {
  id: string;
  title: string;
  artist: string;
  /** Name of the person singing this song at the event */
  singer: string;
  youtubeId: string;
  addedAt: number;
}
