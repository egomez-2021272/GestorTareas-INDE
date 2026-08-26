import rateLimit from "express-rate-limit";

export const requestLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path.endsWith('/health'),
    handler: (req, res) => {
        console.log(`Peticiones excedidas desde IP: ${req.ip}, Endpoint: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Demasiadas peticiones desde esta IP. Por favor vuelva a intentarlo más tarde',
            error: 'RATE_LIMIT_EXCEEDED',
            retryAfter: req.rateLimit?.resetTime
                ? Math.round((req.rateLimit.resetTime - Date.now()) / 1000)
                : null
        });
    }
});