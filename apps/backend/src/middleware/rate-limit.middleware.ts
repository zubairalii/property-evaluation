import rateLimit from 'express-rate-limit';

export const analyzeRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? 'anonymous',
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many valuation requests. Please try again later.',
      data: null,
    });
  },
});
