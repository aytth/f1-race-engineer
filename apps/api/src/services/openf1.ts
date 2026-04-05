import type { Env } from '../types/env';

const memoryCache = new Map<string, { data: unknown; expires: number }>();

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class OpenF1Client {
  private baseUrl: string;
  private kv?: KVNamespace;

  constructor(env: Env) {
    this.baseUrl = env.OPENF1_BASE_URL;
    this.kv = env.F1_CACHE;
  }

  private buildUrl(endpoint: string, params: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async getCached<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    // Check memory cache first
    const memEntry = memoryCache.get(key);
    if (memEntry && memEntry.expires > Date.now()) {
      return memEntry.data as T;
    }

    // Check KV cache
    if (this.kv) {
      try {
        const kvData = await this.kv.get(key, 'json');
        if (kvData) {
          memoryCache.set(key, { data: kvData, expires: Date.now() + ttlSeconds * 1000 });
          return kvData as T;
        }
      } catch {}
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in both caches
    memoryCache.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
    if (this.kv) {
      try {
        await this.kv.put(key, JSON.stringify(data), { expirationTtl: ttlSeconds });
      } catch {}
    }

    return data;
  }

  private async fetchWithRetry<T>(endpoint: string, params: Record<string, string | number>, retries = 3): Promise<T> {
    const url = this.buildUrl(endpoint, params);

    for (let attempt = 0; attempt < retries; attempt++) {
      const res = await fetch(url);

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      if (res.status === 429) {
        // Rate limited — exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`OpenF1 rate limited on ${endpoint}, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
        await sleep(delay);
        continue;
      }

      throw new Error(`OpenF1 API error: ${res.status} ${res.statusText}`);
    }

    throw new Error(`OpenF1 API: max retries exceeded for ${endpoint}`);
  }

  // All historical data is cached aggressively since it never changes
  async getMeetings(year: number) {
    return this.getCached(`meetings:${year}`, 86400, () =>
      this.fetchWithRetry('meetings', { year })
    );
  }

  async getSessions(meetingKey: number) {
    return this.getCached(`sessions:${meetingKey}`, 86400, () =>
      this.fetchWithRetry('sessions', { meeting_key: meetingKey })
    );
  }

  async getDrivers(sessionKey: number) {
    return this.getCached(`drivers:${sessionKey}`, 3600, () =>
      this.fetchWithRetry('drivers', { session_key: sessionKey })
    );
  }

  async getPositions(sessionKey: number) {
    return this.getCached(`positions:${sessionKey}`, 300, () =>
      this.fetchWithRetry('position', { session_key: sessionKey })
    );
  }

  async getLaps(sessionKey: number, driverNumber?: number) {
    const params: Record<string, string | number> = { session_key: sessionKey };
    if (driverNumber) params.driver_number = driverNumber;
    const key = `laps:${sessionKey}:${driverNumber || 'all'}`;
    return this.getCached(key, 300, () =>
      this.fetchWithRetry('laps', params)
    );
  }

  async getIntervals(sessionKey: number) {
    return this.getCached(`intervals:${sessionKey}`, 300, () =>
      this.fetchWithRetry('intervals', { session_key: sessionKey })
    );
  }

  async getStints(sessionKey: number) {
    return this.getCached(`stints:${sessionKey}`, 300, () =>
      this.fetchWithRetry('stints', { session_key: sessionKey })
    );
  }

  async getCarData(sessionKey: number, driverNumber: number) {
    return this.getCached(`cardata:${sessionKey}:${driverNumber}`, 300, () =>
      this.fetchWithRetry('car_data', {
        session_key: sessionKey,
        driver_number: driverNumber,
      })
    );
  }

  async getLocation(sessionKey: number, driverNumber?: number) {
    const params: Record<string, string | number> = { session_key: sessionKey };
    if (driverNumber) params.driver_number = driverNumber;
    const key = `location:${sessionKey}:${driverNumber || 'all'}`;
    return this.getCached(key, 300, () =>
      this.fetchWithRetry('location', params)
    );
  }

  async getWeather(sessionKey: number) {
    return this.getCached(`weather:${sessionKey}`, 300, () =>
      this.fetchWithRetry('weather', { session_key: sessionKey })
    );
  }

  async getRaceControl(sessionKey: number) {
    return this.getCached(`racecontrol:${sessionKey}`, 300, () =>
      this.fetchWithRetry('race_control', { session_key: sessionKey })
    );
  }

  async getPitStops(sessionKey: number) {
    return this.getCached(`pits:${sessionKey}`, 300, () =>
      this.fetchWithRetry('pit', { session_key: sessionKey })
    );
  }

  /**
   * Fetch data with a date filter to get only a ~10s window.
   * Used for car_data and location endpoints where full-session data is too large.
   * OpenF1 uses ?date>=VALUE&date<=VALUE syntax (not standard URL params).
   */
  /**
   * Fetch data with a date range filter.
   * Used for car_data and location endpoints where full-session data is too large.
   * OpenF1 uses ?date>=VALUE&date<=VALUE syntax (not standard URL params).
   * @param windowMs - Duration of the time window in milliseconds (default: 10s)
   */
  async getFilteredData<T>(
    endpoint: string,
    params: Record<string, string | number>,
    afterDate: string,
    windowMs = 10000,
  ): Promise<T[]> {
    const startDate = new Date(afterDate);
    const endDate = new Date(startDate.getTime() + windowMs);

    const cacheKey = `filtered:${endpoint}:${JSON.stringify(params)}:${afterDate}:${windowMs}`;
    return this.getCached(cacheKey, 600, async () => {
      // Build URL manually to avoid encoding >= and <= operators
      const baseParams = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&');
      const url = `${this.baseUrl}/${endpoint}?${baseParams}&date>=${startDate.toISOString()}&date<=${endDate.toISOString()}`;

      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(url);
        if (res.ok) return res.json() as Promise<T[]>;
        if (res.status === 429) {
          await sleep(Math.min(1000 * Math.pow(2, attempt), 10000));
          continue;
        }
        throw new Error(`OpenF1 API error: ${res.status}`);
      }
      throw new Error(`OpenF1 API: max retries exceeded for ${endpoint}`);
    });
  }
}
