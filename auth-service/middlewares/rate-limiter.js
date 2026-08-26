import rateLimit from "express-rate-limit";

export const loginLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 10, // 10 intentos máximos de login
    handler: (req, res) => {
        console.log(`Intentos de login excedidos desde IP: ${req.ip}, Endpoint: ${req.path}`)
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de inicio de sesión, intenta nuevamente más tarde',
            error: 'LOGIN_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round((req.rateLimit.resetTime - Date.now()) / 1000)
        })
    }
});
