/**
 * Configuración de seguridad HTTP usando Helmet para el servidor INDE-Tasks.
 *
 * Incluye:
 * - Content Security Policy (CSP) para restringir recursos cargados
 * - Protección contra clickjacking (frameguard)
 * - Eliminación del header X-Powered-By
 * - Configuración de políticas de recursos entre orígenes
 *
 * Nota:
 * - Se permite el uso de 'unsafe-inline' en scripts y estilos (no recomendado en producción estricta)
 * - HSTS está deshabilitado (útil en desarrollo, pero debería activarse en producción con HTTPS)
 */
export const helmetOptions = {
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'none'"] // corregido (antes estaba mal escrito)
        }
    },

    hsts: false, // deshabilitado (activar en producción con HTTPS)

    frameguard: { action: 'deny' }, // evita que la app se cargue en iframes

    hidePoweredBy: true, // oculta información del servidor

    crossOriginResourcePolicy: { policy: 'cross-origin' },

    crossOriginEmbedderPolicy: false
};