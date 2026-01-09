export type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
};

export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit & { signal?: AbortSignal }, options: RetryOptions = {}) {
  const { retries = 2, baseDelayMs = 300 } = options;
  let attempt = 0;
  let lastError: any;

  while (attempt <= retries) {
    try {
      const res = await fetch(input, init);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err: any) {
      lastError = err;
      // Abort immediately if aborted
      if (init?.signal?.aborted) throw err;
      // Only retry on network-ish errors
      const transient = err?.name === 'TypeError' || /Network|fetch|Failed/i.test(err?.message || '');
      if (!transient || attempt === retries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
  throw lastError;
}
