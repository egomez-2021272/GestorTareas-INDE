import {
    createUserRecord,
    activateUserAccount,
    setPasswordOnActivationRecord,
    loginUser,
    changePassword,
    requestPasswordReset,
    resetPassword,
    updateProfileRecord,
    getAllUsersRecord,
    toggleUserStatusRecord,
    deleteUserRecord
} from "./user.services.js";
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    try {
        // pasamos el flag createdByAdmin si viene del admin frontend
        const user = await createUserRecord({ 
            userData: req.body, 
            createdByAdmin: req.body.createdByAdmin === true 
        });

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Revisa tu correo para activar tu cuenta.',
            data: user
        });

    } catch (e) {
            // Si el error viene del envío de correo, el usuario YA fue guardado en BD.
            if (e.message.includes('correo') || e.message.includes('EMAIL') || e.message.includes('nodemailer')) {
                console.error('Fallo al enviar correo de activación:', e.message);
                return res.status(500).json({
                    success: false,
                    message: 'Usuario creado pero no se pudo enviar el correo de activación. Contacta a soporte.'
                });
            }

            console.error('Error al registrar el usuario:', e.message);
            return res.status(500).json({
                success: false,
                message: 'Error al registrar el usuario',
                error: e.message
            });
        }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await getAllUsersRecord({ page, limit });
        res.status(200).json({ success: true, data: result.users, pagination: result.pagination });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await toggleUserStatusRecord(id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteUserRecord(id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

//Activar cuenta
export const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;
        const result = await activateUserAccount(token);

        return res.status(200).json({
            success: true,
            alreadyActive: result.alreadyActive,
            message: result.alreadyActive
                ? 'Tu cuenta fue activada. Puedes iniciar sesion.'
                : 'Tu cuenta fue activada. Puedes iniciar sesion.'
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            code: e.code || 'ACTIVATION_ERROR',
            message: e.code === 'ACTIVATION_TOKEN_INVALID'
                ? 'Tu cuenta fue activada. Puedes iniciar sesion.'
                : 'No pudimos activar la cuenta en este momento.',
            error: e.message
        });
    }
};


//Login
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await loginUser(username, password);

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE
            }
        );

        //poder relacionar los mensajes realizados en .net
//poder relacionar los mensajes realizados en .net
        let dailyMessage = null;
        try {
            const mgResponse = await fetch(
                `${process.env.DAILY_MESSAGE_URL || 'http://localhost:5001'}/api/daily-message/today/${user._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    signal: AbortSignal.timeout(2500)
                }
            );
            if (mgResponse.ok) {
                const msgData = await mgResponse.json();
                dailyMessage = msgData.data;
            } else {
                console.error('daily-service respondió con status:', mgResponse.status);
            }
        } catch (err) {
            console.error('daily-positive-service no está disponible o tardó demasiado:', err.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: { user, token, dailyMessage }
        });

    } catch (e) {
        return res.status(401).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: e.message
        });
    }
};

//Actualizar Contraseña
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        await changePassword(userId, currentPassword, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: 'Error al cambiar la contraseña',
            error: e.message
        });
    }
};


//Recuperar contraseña(olvidada)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await requestPasswordReset(email);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: e.message
        });
    }
};


//Restablecer contraseña
export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const result = await resetPassword(token, newPassword);

        return res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            message: 'Error al restablecer la contraseña',
            error: e.message
        });
    }
};


//Crear Admin 
export const createAdmin = async (req, res) => {
    try {
        const user = await createUserRecord({
            userData: { ...req.body, role: 'ADMIN_ROLE' },
            createdByAdmin: true
        });

        return res.status(201).json({
            success: true,
            message: 'Admin creado exitosamente.',
            data: user
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear el admin',
            error: e.message
        });
    }
};

export const setPasswordOnActivation = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const result = await setPasswordOnActivationRecord(token, newPassword);

        return res.status(200).json({
            success: true,
            message: 'Contraseña guardada y cuenta activada exitosamente.'
        });

    } catch (e) {
        return res.status(400).json({
            success: false,
            code: e.code || 'ACTIVATION_ERROR',
            message: e.code === 'ACTIVATION_TOKEN_INVALID'
                ? 'Este enlace ya fue usado o es inválido.'
                : 'No pudimos guardar la contraseña.',
            error: e.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await updateProfileRecord(userId, req.body);

        return res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: user
        });
    } catch (e) {
        return res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al actualizar el perfil',
            error: e.message
        });
    }
};
