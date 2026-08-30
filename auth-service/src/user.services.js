import { hash, verify } from "@node-rs/bcrypt";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../configs/db.configuration.js";
import { toUser } from "./user.model.js";
import {
  sendActivationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../helpers/email.helper.js";

const publicUser = (user) => {
  const {
    password,
    activationToken,
    resetPasswordToken,
    resetPasswordExpires,
    ...safeUser
  } = user;
  return safeUser;
};

const findById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return toUser(rows[0]);
};

export const createUserRecord = async ({
  userData,
  createdByAdmin = false,
}) => {
  const password = await hash(userData.password, 10);
  const activationToken = uuidv4();
  const resetToken = createdByAdmin ? '00000000-0000-0000-0000-000000000000' : null;
  const { rows } = await pool.query(
    `INSERT INTO users (id, first_name, surname, email, username, password, role, is_active, activation_token, reset_password_token)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [
      uuidv4(),
      userData.firstName,
      userData.surname,
      userData.email,
      userData.username,
      password,
      userData.role || "USER_ROLE",
      false, // always false initially to require activation
      activationToken,
      resetToken
    ],
  );
  const user = toUser(rows[0]);
  await sendActivationEmail(
    user.email,
    activationToken,
    user.firstName,
    createdByAdmin,
    userData.password,
    userData.username
  );
  return publicUser(user);
};

export const setPasswordOnActivationRecord = async (token, newPassword) => {
  const hashedPassword = await hash(newPassword, 10);
  const { rows } = await pool.query(
    `UPDATE users SET is_active = TRUE, activation_token = NULL, password = $1,
         reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW()
         WHERE activation_token = $2 RETURNING *`,
    [hashedPassword, token],
  );
  if (!rows[0]) {
    const error = new Error("Este enlace ya fue usado o expiró.");
    error.code = "ACTIVATION_TOKEN_INVALID";
    throw error;
  }
  return publicUser(toUser(rows[0]));
};

export const activateUserAccount = async (token) => {
  // First, get the user to check if they have the special admin-created marker
  const { rows: checkRows } = await pool.query(
    "SELECT reset_password_token FROM users WHERE activation_token = $1",
    [token],
  );
  
  if (!checkRows[0]) {
    const error = new Error("Este enlace ya fue usado o expiró.");
    error.code = "ACTIVATION_TOKEN_INVALID";
    throw error;
  }
  
  const hasSpecialToken = checkRows[0].reset_password_token === '00000000-0000-0000-0000-000000000000';
  
  // Update user - preserve the special token if it exists
  const { rows } = await pool.query(
    `UPDATE users SET is_active = TRUE, activation_token = NULL, updated_at = NOW()
         WHERE activation_token = $1 RETURNING *`,
    [token],
  );
  
  const user = toUser(rows[0]);
  
  // If the user had the special token, make sure it's preserved
  if (hasSpecialToken && user.resetPasswordToken !== '00000000-0000-0000-0000-000000000000') {
    await pool.query(
      "UPDATE users SET reset_password_token = '00000000-0000-0000-0000-000000000000' WHERE id = $1",
      [user.id]
    );
    user.resetPasswordToken = '00000000-0000-0000-0000-000000000000';
  }
  
  return { alreadyActive: false, user };
};

export const loginUser = async (username, password) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1",
    [username],
  );
  const user = toUser(rows[0]);
  if (!user || !(await verify(password, user.password))) {
    const error = new Error("Credenciales inválidas");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }
  if (!user.isActive) {
    const error = new Error("Cuenta no activada");
    error.code = "ACCOUNT_NOT_ACTIVE";
    throw error;
  }

  let isFirstLogin = false;
  if (user.resetPasswordToken === '00000000-0000-0000-0000-000000000000') {
    isFirstLogin = true;
  }

  if (isFirstLogin) {
    sendWelcomeEmail(user.email, user.firstName, user.username).catch((error) =>
      console.error("Error al enviar email de bienvenida:", error),
    );
  }
  
  // Return the full user object (including resetPasswordToken) so controller can calculate requiresPasswordChange
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await findById(userId);
  if (!user) throw new Error("Usuario no encontrado");
  if (!(await verify(currentPassword, user.password)))
    throw new Error("Contraseña actual incorrecta");
  const password = await hash(newPassword, 10);
  await pool.query(
    "UPDATE users SET password = $1, reset_password_token = NULL, updated_at = NOW() WHERE id = $2",
    [password, userId],
  );
  await sendPasswordChangedEmail(user.email, user.firstName);
  return { message: "Contraseña actualizada exitosamente" };
};

export const requestPasswordReset = async (email) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email],
  );
  const user = toUser(rows[0]);
  if (!user) throw new Error("No existe un usuario con ese correo electrónico");
  if (!user.isActive) throw new Error("La cuenta no está activada");
  const token = uuidv4();
  await pool.query(
    `UPDATE users SET reset_password_token = $1, reset_password_expires = NOW() + INTERVAL '1 hour', updated_at = NOW() WHERE id = $2`,
    [token, user.id],
  );
  await sendPasswordResetEmail(user.email, token, user.firstName);
  return {
    message:
      "Se ha enviado un correo con instrucciones para restablecer tu contraseña",
  };
};

export const resetPassword = async (token, newPassword) => {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW() LIMIT 1",
    [token],
  );
  const user = toUser(rows[0]);
  if (!user) throw new Error("Token de recuperación inválido o expirado");
  const password = await hash(newPassword, 10);
  await pool.query(
    `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = $2`,
    [password, user.id],
  );
  await sendPasswordChangedEmail(user.email, user.firstName);
  return { message: "Contraseña restablecida exitosamente" };
};

export const updateProfileRecord = async (id, data) => {
  const user = await findById(id);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }
  const values = {
    firstName: data.firstName ?? user.firstName,
    surname: data.surname ?? user.surname,
    email: data.email ?? user.email,
    username: data.username ?? user.username,
  };
  const { rows } = await pool.query(
    `UPDATE users SET first_name=$1, surname=$2, email=$3, username=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
    [values.firstName, values.surname, values.email, values.username, id],
  );
  return publicUser(toUser(rows[0]));
};

export const getAllUsersRecord = async ({ page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const [{ rows }, count] = await Promise.all([
    pool.query(
      "SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [safeLimit, (safePage - 1) * safeLimit],
    ),
    pool.query("SELECT COUNT(*)::int AS total FROM users"),
  ]);
  return {
    users: rows.map((row) => publicUser(toUser(row))),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count.rows[0].total,
      totalPages: Math.ceil(count.rows[0].total / safeLimit),
    },
  };
};

export const toggleUserStatusRecord = async (id, actingUser) => {
  const existingUser = await findById(id);
  if (!existingUser) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }
  const protectedAdminEmail = process.env.SEEDER_ADMIN_EMAIL || 'adminindetask@inde.admin';
  const authenticatedUser = actingUser?.id ? await findById(actingUser.id) : null;

  if (existingUser.email === protectedAdminEmail) {
    const error = new Error(
      "No se puede desactivar al administrador base",
    );
    error.statusCode = 400;
    throw error;
  }

  if (existingUser.role === 'ADMIN_ROLE' && authenticatedUser?.email !== protectedAdminEmail) {
    const error = new Error(
      "Solo el administrador protegido puede modificar cuentas de administrador",
    );
    error.statusCode = 403;
    throw error;
  }

  const { rows } = await pool.query(
    "UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING *",
    [id],
  );
  return publicUser(toUser(rows[0]));
};

export const deleteUserRecord = async (id) => {
  const existingUser = await findById(id);
  if (!existingUser) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }
  if (existingUser.email === (process.env.SEEDER_ADMIN_EMAIL || 'adminindetask@inde.admin')) {
    const error = new Error(
      "No se puede eliminar al administrador base",
    );
    error.statusCode = 400;
    throw error;
  }

  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
    id,
  ]);
  if (!rowCount) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }
  return { message: "Usuario eliminado correctamente" };
};
