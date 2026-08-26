const parseOrigins = (raw) =>
    (raw || '')
        .split(',')
        .map((o) => o.trim().replace(/\/$/, '')) // quita barra final si la tuviera
        .filter(Boolean);

const allowedOrigins = parseOrigins(process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL);

console.log('[CORS] auth-service — orígenes permitidos:', allowedOrigins);

export const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.replace(/\/$/, '');

        if (allowedOrigins.includes(normalizedOrigin)) {
            return callback(null, true);
        }

        console.warn(`[CORS] Origen rechazado: "${origin}". Permitidos: ${allowedOrigins.join(', ')}`);
        return callback(new Error('No permitido por política CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};