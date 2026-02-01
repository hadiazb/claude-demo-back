/**
 * Welcome email template for new user registration.
 */
export interface WelcomeEmailData {
  firstName: string;
  appName: string;
  loginUrl?: string;
}

/**
 * Generates the HTML content for the welcome email.
 * @param data - Template data for personalization
 * @returns HTML string for the email
 */
export function getWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { firstName, appName, loginUrl = '#' } = data;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a ${appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background-color: #4F46E5; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                ${appName}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                ¡Bienvenido, ${firstName}!
              </h2>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte con nosotros.
              </p>

              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Ya puedes acceder a todas las funcionalidades de la plataforma.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #4F46E5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px;">
                      Iniciar Sesión
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2026 ${appName}. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                Este es un mensaje automático, por favor no respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates the plain text version of the welcome email.
 * @param data - Template data for personalization
 * @returns Plain text string for the email
 */
export function getWelcomeEmailText(data: WelcomeEmailData): string {
  const { firstName, appName } = data;

  return `
¡Bienvenido a ${appName}, ${firstName}!

Tu cuenta ha sido creada exitosamente. Estamos emocionados de tenerte con nosotros.

Ya puedes acceder a todas las funcionalidades de la plataforma.

Si tienes alguna pregunta, no dudes en contactarnos.

---
© 2026 ${appName}. Todos los derechos reservados.
  `.trim();
}
