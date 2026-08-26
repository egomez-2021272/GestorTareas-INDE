import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 10
});

const initializeSchema = () => pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        first_name VARCHAR(35) NOT NULL,
        surname VARCHAR(35) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(40) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER_ROLE' CHECK (role IN ('ADMIN_ROLE', 'USER_ROLE')),
        is_active BOOLEAN NOT NULL DEFAULT FALSE,
        activation_token UUID,
        reset_password_token UUID,
        reset_password_expires TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
`);

export const dbConnection = async () => {
    console.log('PostgreSQL | Intentando conectar...');
    await pool.query('SELECT 1');
    await initializeSchema();
    console.log(`PostgreSQL | Conectado a la base de datos ${process.env.DB_NAME}`);
};

const gracefulShutdown = async (signal) => {
    console.log(`PostgreSQL | Señal ${signal} recibida, cerrando conexión...`);
    await pool.end();
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
