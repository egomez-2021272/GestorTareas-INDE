import { v4 as uuidv4 } from 'uuid';
import { pool } from '../configs/db.configuration.js';

const toUser = (row) => row && ({
    _id: row.id, id: row.id, firstName: row.first_name, surname: row.surname,
    email: row.email, username: row.username, password: row.password, role: row.role,
    isActive: row.is_active, activationToken: row.activation_token,
    resetPasswordToken: row.reset_password_token, resetPasswordExpires: row.reset_password_expires,
    createdAt: row.created_at, updatedAt: row.updated_at
});

const fields = { email: 'email', username: 'username', activationToken: 'activation_token' };

const User = {
    async findOne(criteria) {
        const [key, value] = Object.entries(criteria)[0];
        const column = fields[key];
        if (!column) throw new Error('Campo de búsqueda no permitido');
        const { rows } = await pool.query(`SELECT * FROM users WHERE ${column} = $1 LIMIT 1`, [value]);
        return toUser(rows[0]);
    },
    async create(user) {
        const { rows } = await pool.query(
            `INSERT INTO users (id, first_name, surname, email, username, password, role, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [uuidv4(), user.firstName, user.surname, user.email, user.username, user.password, user.role || 'USER_ROLE', user.isActive ?? false]
        );
        return toUser(rows[0]);
    }
};

export { toUser };
export default User;
