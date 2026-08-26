import 'dotenv/config';
import crypto from 'crypto';

// Añadir un salt aleatorio en cada inicio del servidor invalida todos los JWT anteriores
// para forzar cierre de sesión por temas de seguridad si se reinicia el servidor.
process.env.JWT_SECRET = (process.env.JWT_SECRET || 'inde-secret-key') + crypto.randomBytes(16).toString('hex');

import { initServer } from './configs/app.js';

initServer();