import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';

const points = Number.parseInt(process.env.UPLOAD_RATE_LIMIT_POINTS ?? '5', 10);
const duration = Number.parseInt(process.env.UPLOAD_RATE_LIMIT_DURATION ?? '60', 10);

const uploadRateLimiter = new RateLimiterMemory({
  points: Number.isFinite(points) && points > 0 ? points : 5,
  duration: Number.isFinite(duration) && duration > 0 ? duration : 60,
});

export async function consumeUploadRateLimit(key: string): Promise<RateLimiterRes | null> {
  try {
    await uploadRateLimiter.consume(key);
    return null;
  } catch (error) {
    if (error instanceof RateLimiterRes) {
      return error;
    }
    throw error;
  }
}
