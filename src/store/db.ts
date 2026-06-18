import Dexie, { type Table } from 'dexie';

export interface PageDataCache {
  id?: number;
  endpoint: string;
  queryKey: string;
  data: any;
  timestamp: number;
  total?: number;
  nextCursor?: string;
}

export class AppDatabase extends Dexie {
  pageDataCache!: Table<PageDataCache>;

  constructor() {
    super('MelDashboardDB');
    this.version(1).stores({
      pageDataCache: 'endpoint, queryKey, timestamp',
    });
  }
}

export const db = new AppDatabase();

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export async function getCachedData(endpoint: string, queryKey: string) {
  const cached = await db.pageDataCache
    .where('[endpoint+queryKey]')
    .equals([endpoint, queryKey])
    .first();

  if (!cached) return null;

  // Check if cache is expired
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    await db.pageDataCache.delete(cached.id!);
    return null;
  }

  return cached;
}

export async function setCachedData(
  endpoint: string,
  queryKey: string,
  data: any,
  total?: number,
  nextCursor?: string,
) {
  await db.pageDataCache.put({
    endpoint,
    queryKey,
    data,
    timestamp: Date.now(),
    total,
    nextCursor,
  });
}

export async function clearCacheForEndpoint(endpoint: string) {
  await db.pageDataCache.where('endpoint').equals(endpoint).delete();
}

export async function clearAllCache() {
  await db.pageDataCache.clear();
}
