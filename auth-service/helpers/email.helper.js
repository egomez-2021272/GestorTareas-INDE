import nodemailer from 'nodemailer';

const APP_NAME = "INDE-task's";
const BRAND = {
    background: '#12141a',
    panel: '#20242d',
    panelLight: '#2a2f3a',
    primary: '#0aa5b5',
    primaryDark: '#067e8b',
    text: '#e2e8f0',
    muted: '#94a3b8',
    border: '#333a47'
};

const emailLayout = ({ title, content, actionLabel, actionUrl, footer }) => `
    <!DOCTYPE html>
    <html lang="es">
        <body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: Arial, Helvetica, sans-serif; color: ${BRAND.text};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.background}; padding: 32px 16px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: ${BRAND.panel}; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden;">
                            <tr>
                                <td style="padding: 24px 32px; background: linear-gradient(135deg, ${BRAND.panelLight} 0%, ${BRAND.panel} 100%); border-bottom: 3px solid ${BRAND.primary};">
                                    <p style="margin: 0; color: ${BRAND.primary}; font-size: 13px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;">Gestión de tareas</p>
                                    <h1 style="margin: 6px 0 0; color: ${BRAND.text}; font-size: 26px; line-height: 1.25; font-weight: 700;">${APP_NAME}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 32px;">
                                    <h2 style="margin: 0 0 16px; color: ${BRAND.text}; font-size: 22px; line-height: 1.3;">${title}</h2>
                                    <div style="color: ${BRAND.text}; font-size: 15px; line-height: 1.6;">${content}</div>
                                    ${actionLabel && actionUrl ? `
                                        <div style="text-align: center; margin: 28px 0;">
                                            <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%); border-radius: 6px; color: #ffffff; font-size: 15px; font-weight: 700; padding: 13px 26px; text-decoration: none;">${actionLabel}</a>
                                        </div>
                                        <p style="margin: 0; color: ${BRAND.muted}; font-size: 13px; line-height: 1.5;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                                        <p style="margin: 8px 0 0; color: ${BRAND.primary}; font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; word-break: break-word;">${actionUrl}</p>
                                    ` : ''}
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 20px 32px; background-color: ${BRAND.background}; border-top: 1px solid ${BRAND.border};">
                                    <p style="margin: 0; color: ${BRAND.muted}; font-size: 12px; line-height: 1.5;">${footer}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
`;

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER o EMAIL_PASS no estan configurados en .env');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Helper centralizado para enviar por Brevo HTTP API (puerto 443, sin bloqueo en Render) o Nodemailer (local)
const sendEmail = async ({ to, subject, html, recipientName = '' }) => {
    const apiKey = process.env.BREVO_API_KEY || (process.env.EMAIL_PASS?.startsWith('xkeysib-') ? process.env.EMAIL_PASS : null);

    if (apiKey) {
        // Envío vía Brevo REST API (HTTPS/443 - Perfecto para servidores nube gratis como Render)
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    name: APP_NAME, 
                    email: process.env.EMAIL_USER 
                },
                to: [{ email: to, name: recipientName || 'Usuario' }],
                subject: subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Email Helper] Error desde Brevo API:', response.status, errorData);
            throw new Error(`Error al enviar correo vía Brevo (${response.status}): ${errorData.message || ''}`);
        }
        console.log(`[Email Helper] Correo enviado exitosamente vía Brevo API a ${to}`);
        return;
    }

    // Fallback por defecto: Nodemailer SMTP
    const transporter = createTransporter();
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html
    });
    console.log(`[Email Helper] Correo enviado exitosamente vía Nodemailer a ${to}`);
};

export const sendActivationEmail = async (email, token, firstName) => {
    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate/${token}`;

    const html = emailLayout({
        title: `Bienvenido/a, ${firstName}`,
        content: '<p style="margin: 0;">Tu cuenta fue creada correctamente. Actívala para comenzar a organizar y gestionar tus tareas.</p>',
        actionLabel: 'Activar mi cuenta',
        actionUrl: activationLink,
        footer: 'Si no solicitaste esta cuenta, puedes ignorar este correo.'
    });

    try {
        await sendEmail({ to: email, subject: `Activa tu cuenta - ${APP_NAME}`, html, recipientName: firstName });
    } catch (error) {
        console.error('Error al enviar email de activación:', error);
        throw new Error('Error al enviar el correo de activacion');
    }
};

export const sendWelcomeEmail = async (email, firstName, username) => {
    const html = emailLayout({
        title: `Hola, ${firstName}`,
        content: `
            <p style="margin: 0 0 20px;">Tu cuenta en ${APP_NAME} ha sido activada exitosamente.</p>
            <div style="background-color: ${BRAND.panelLight}; border-left: 4px solid ${BRAND.primary}; border-radius: 4px; padding: 16px;">
                <p style="margin: 0 0 4px; color: ${BRAND.muted}; font-size: 13px;">TU NOMBRE DE USUARIO</p>
                <p style="margin: 0; color: ${BRAND.text}; font-size: 17px; font-weight: 700;">${username}</p>
            </div>
            <p style="margin: 20px 0 0;">Ya puedes iniciar sesión y comenzar a utilizar la plataforma.</p>
        `,
        footer: 'Este es un correo automático; por favor, no respondas a este mensaje.'
    });

    try {
        await sendEmail({ to: email, subject: `Bienvenido/a a ${APP_NAME}`, html, recipientName: firstName });
    } catch (error) {
        console.error('Error al enviar email de bienvenida:', error);
    }
};

export const sendPasswordResetEmail = async (email, token, username) => {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const html = emailLayout({
        title: `Hola, ${username}`,
        content: `
            <p style="margin: 0 0 16px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${APP_NAME}.</p>
            <p style="margin: 0; color: ${BRAND.primary}; font-weight: 700;">Por seguridad, este enlace expirará en 1 hora.</p>
        `,
        actionLabel: 'Restablecer mi contraseña',
        actionUrl: resetLink,
        footer: 'Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.'
    });

    try {
        await sendEmail({ to: email, subject: `Recuperación de contraseña - ${APP_NAME}`, html, recipientName: username });
    } catch (error) {
        console.error('Error al enviar email de reset:', error);
        throw new Error('Error al enviar el correo de recuperacion');
    }
};

export const sendPasswordChangedEmail = async (email, firstName) => {
    const html = emailLayout({
        title: `Hola, ${firstName}`,
        content: `
            <p style="margin: 0 0 20px;">Te confirmamos que tu contraseña fue cambiada exitosamente.</p>
            <div style="background-color: ${BRAND.panelLight}; border-left: 4px solid ${BRAND.primary}; border-radius: 4px; padding: 16px;">
                <p style="margin: 0; color: ${BRAND.text};">La contraseña se actualizó el ${new Date().toLocaleString('es-ES')}.</p>
            </div>
            <p style="margin: 20px 0 0; color: ${BRAND.text};"><strong>¿No realizaste este cambio?</strong> Contacta inmediatamente con nuestro equipo de soporte.</p>
        `,
        footer: 'Este es un correo automático de seguridad de INDE-task\'s.'
    });

    try {
        await sendEmail({ to: email, subject: `Tu contraseña fue cambiada - ${APP_NAME}`, html, recipientName: firstName });
    } catch (error) {
        console.error('Error al enviar email de confirmacion:', error);
    }
};
