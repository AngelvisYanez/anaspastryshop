import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM =
  process.env.RESEND_FROM_EMAIL ??
  "Ana's Pastry Shop <noreply@anaspastryshop.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://anaspastryshop.com";

const LOGO_URL = `${BASE_URL}/logo-anas-pastry-shop.png`;

// Ana's Pastry Shop official brand palette.
// Debe coincidir con `app/globals.css` (--accent / --accent-hover). Los emails son
// un medio de color fijo, así que se fija siempre el valor del tema claro.
const BRAND_DARK = "#2B0938"; // Deep artisanal blackberry / plum
const BRAND_DARK_LIGHT = "#441154"; // Rich plum accent
const ACCENT = "#C51E75"; // Official raspberry magenta (--accent)
const ACCENT_HOVER = "#A8185F"; // --accent-hover
const CREAM = "#FCF8FA"; // Warm confectioner cream
const CREAM_DARK = "#F3D9E8"; // Delicate pastry rose border
const WHITE = "#ffffff";
const MUTED = "#7A5B79"; // Soft warm muted plum

// Aliases for template compatibility
const NAVY = BRAND_DARK;
const GOLD = ACCENT;
const NAVY_LIGHT = BRAND_DARK_LIGHT;

function buildEmail(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Ana's Pastry Shop</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${CREAM}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,Arial,sans-serif;">

  <div class="preheader" style="font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">

        <!-- OUTER WRAPPER -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

          <!-- BRAND ACCENT BAR TOP -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${ACCENT} 0%,#F4499E 50%,${ACCENT} 100%);border-radius:4px 4px 0 0;"></td>
          </tr>

          <!-- HEADER: BRAND DARK BACKGROUND -->
          <tr>
            <td style="background-color:${BRAND_DARK};padding:32px 40px 28px;border-radius:0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Logo brand lockup -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color:${ACCENT};width:3px;border-radius:2px;">&nbsp;</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};line-height:1.2;">Workshops &amp; Formación</p>
                          <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:-0.02em;color:${WHITE};line-height:1.2;">Ana's Pastry Shop</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.45);">anaspastryshop.com</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background-color:${WHITE};padding:0 40px 40px;border-radius:0 0 24px 24px;border:1px solid ${CREAM_DARK};border-top:none;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:28px 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding:0 12px;border-right:1px solid ${CREAM_DARK};">
                          <a href="${BASE_URL}/workshops" style="font-size:11px;font-weight:700;color:${MUTED};text-decoration:none;">Workshops</a>
                        </td>
                        <td style="padding:0 12px;border-right:1px solid ${CREAM_DARK};">
                          <a href="${BASE_URL}/cursos" style="font-size:11px;font-weight:700;color:${MUTED};text-decoration:none;">Cursos Online</a>
                        </td>
                        <td style="padding:0 12px;border-right:1px solid ${CREAM_DARK};">
                          <a href="${BASE_URL}/pasteleria" style="font-size:11px;font-weight:700;color:${MUTED};text-decoration:none;">Pastelería</a>
                        </td>
                        <td style="padding:0 12px;">
                          <a href="${BASE_URL}/dashboard" style="font-size:11px;font-weight:700;color:${MUTED};text-decoration:none;">Mi Panel</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="font-size:11px;color:${MUTED};line-height:1.6;margin:0;">
                      &copy; ${new Date().getFullYear()} Ana's Pastry Shop &middot; Chef Anais Flores. Todos los derechos reservados.<br>
                      Coro, Falcón, Venezuela &middot; Estás recibiendo este correo porque tienes una cuenta en nuestra plataforma.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function brandDivider(): string {
  return `<tr>
    <td style="height:1px;background:linear-gradient(90deg,transparent,${ACCENT}40,transparent);margin:0;padding:0;"></td>
  </tr>`;
}

function label(text: string): string {
  return `<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};">${text}</p>`;
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${color};font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:4px 12px;border-radius:20px;">${text}</span>`;
}

function resolveButtonParams(a: string, b: string): { href: string; text: string } {
  if (a.startsWith("http") || a.startsWith("/")) {
    return { href: a, text: b };
  }
  return { href: b, text: a };
}

function ctaButton(arg1: string, arg2?: string): string {
  const { href, text } = arg2 ? resolveButtonParams(arg1, arg2) : { href: arg1, text: "Continuar" };
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius:50px;background-color:${ACCENT};">
        <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${WHITE};text-decoration:none;border-radius:50px;">${text} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

function ctaButtonGold(arg1: string, arg2?: string): string {
  const { href, text } = arg2 ? resolveButtonParams(arg1, arg2) : { href: arg1, text: "Continuar" };
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius:50px;background-color:${ACCENT};">
        <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${WHITE};text-decoration:none;border-radius:50px;">${text} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

function featureRow(icon: string, text: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td width="28" style="vertical-align:top;padding-top:1px;">
            <div style="width:20px;height:20px;background-color:rgba(217,32,128,0.12);border-radius:50%;text-align:center;line-height:20px;font-size:11px;">${icon}</div>
          </td>
          <td style="font-size:13px;color:#374151;font-weight:500;padding-left:10px;line-height:1.5;">${text}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

async function getTemplateConfig(type: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const template = await prisma.emailTemplate.findUnique({ where: { type } });
    if (!template) return { isEnabled: true };
    return {
      subject: template.subject || undefined,
      preheader: template.preheader || undefined,
      title: template.title || undefined,
      isEnabled: template.isEnabled,
    };
  } catch {
    return { isEnabled: true };
  }
}

export async function sendWelcomeEmail(email: string, name: string | null) {
  const config = await getTemplateConfig("WELCOME");
  if (!config.isEnabled) return;
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <!-- DECORATIVE TOP SECTION -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARK_LIGHT} 100%);padding:40px;margin:-1px -1px 0;border-radius:0;text-align:center;">
          <p style="margin:0 0 12px;font-size:36px;">🧁</p>
          <h1 style="margin:0;font-size:28px;font-weight:900;color:${WHITE};letter-spacing:-0.03em;line-height:1.1;">
            ¡Bienvenido, ${firstName}!
          </h1>
          <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.7);font-weight:500;">Tu espacio en Ana's Pastry Shop</p>
        </td>
      </tr>

      <!-- BRAND STRIPE -->
      <tr>
        <td style="height:3px;background:${ACCENT};"></td>
      </tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;font-weight:400;">
            Tu cuenta ha sido creada exitosamente. Te damos la bienvenida a nuestra academia y atelier de pastelería, donde aprenderás las técnicas, secretos y recetas profesionales de la Chef Anais Flores.
          </p>

          <!-- FEATURE LIST -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border:1px solid ${CREAM_DARK};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 20px 0;background-color:${CREAM};">
                ${label("Con tu cuenta puedes")}
              </td>
            </tr>
            <tr><td style="padding:0 20px;background-color:${CREAM};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("🎂", "Reservar tu cupo en workshops presenciales intensivos")}
                ${featureRow("💻", "Acceder a cursos online con contenido en video paso a paso")}
                ${featureRow("📱", "Gestionar tus pedidos de pastelería artesanal y entregas")}
                ${featureRow("✨", "Descargar guías, recetarios y materiales exclusivos")}
              </table>
            </td></tr>
            <tr><td style="height:16px;background-color:${CREAM};"></td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:20px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/workshops`, "Ver Workshops Presenciales")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <a href="${BASE_URL}/cursos" style="font-size:12px;font-weight:700;color:${MUTED};text-decoration:underline;letter-spacing:0.05em;">
                  Explorar cursos online &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject:
        config.subject ||
        `¡Bienvenido a Ana's Pastry Shop, ${firstName}!`,
      html: buildEmail(
        config.preheader ||
          `Bienvenido ${firstName}, tu cuenta en Ana's Pastry Shop está lista. Empieza hoy.`,
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendWelcomeEmail error:", err);
  }
}

export async function sendAccountApprovedEmail(
  email: string,
  name: string | null,
) {
  const config = await getTemplateConfig("ACCOUNT_APPROVED");
  if (!config.isEnabled) return;
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARK_LIGHT} 100%);padding:40px;text-align:center;">
          <div style="width:64px;height:64px;background:rgba(217,32,128,0.2);border:2px solid ${ACCENT};border-radius:50%;margin:0 auto 20px;text-align:center;line-height:60px;font-size:28px;color:${WHITE};">✓</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">¡Cuenta Aprobada!</h1>
          <p style="margin:0;font-size:13px;color:${ACCENT};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Acceso Habilitado</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${ACCENT};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, tu cuenta en <strong style="color:${BRAND_DARK};font-weight:800;">Ana's Pastry Shop</strong> ha sido
            revisada y aprobada. Ya puedes iniciar sesión y acceder a todas las secciones habilitadas.
          </p>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:${CREAM};border:1px solid ${CREAM_DARK};border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px 20px 0;">${label("Lo que puedes hacer ahora")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("🎂", "Inscribirte en workshops presenciales")}
                ${featureRow("💻", "Acceder a cursos online")}
                ${featureRow("🍰", "Hacer tus pedidos de pastelería")}
                ${featureRow("🧁", "Gestionar tus pagos y certificados")}
              </table>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/dashboard`, "Ir a mi Panel")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <a href="${BASE_URL}/workshops" style="font-size:12px;font-weight:700;color:${MUTED};text-decoration:underline;letter-spacing:0.05em;">
                  Ver workshops presenciales &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject:
        config.subject || `¡Tu cuenta ha sido aprobada! — Ana's Pastry Shop`,
      html: buildEmail(
        config.preheader ||
          `${firstName}, tu cuenta fue aprobada. Ya puedes acceder a la plataforma.`,
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendAccountApprovedEmail error:", err);
  }
}

export async function sendPaymentRejectedEmail(
  email: string,
  name: string | null,
  reason?: string,
) {
  const config = await getTemplateConfig("PAYMENT_REJECTED");
  if (!config.isEnabled) return;
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,#180520 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">⚠️</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">Pago No Validado</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Revisión Pendiente</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${ACCENT};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, no pudimos verificar el comprobante de pago enviado para tu orden en
            <strong style="color:${BRAND_DARK};font-weight:800;">Ana's Pastry Shop</strong>.
            A continuación encontrarás el detalle para solventarlo.
          </p>

          ${
            reason
              ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-left:4px solid ${ACCENT};background:${CREAM};border:1px solid ${CREAM_DARK};border-left-width:4px;border-radius:0 12px 12px 0;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${ACCENT};">Motivo reportado</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-weight:500;">${reason}</p>
              </td>
            </tr>
          </table>`
              : ""
          }

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:${CREAM};border:1px solid ${CREAM_DARK};border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px 20px 0;">${label("¿Qué puedes hacer?")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("💳", "Intenta realizar el pago nuevamente con los datos de cuenta actualizados")}
                ${featureRow("📸", "Asegúrate de que la captura muestre claramente el número de referencia y monto")}
                ${featureRow("💬", "Escríbenos directamente por WhatsApp si consideras que hubo una confusión")}
              </table>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/dashboard`, "Subir Nuevo Comprobante")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <p style="margin:0;font-size:12px;color:${MUTED};font-weight:500;">
                  ¿Necesitas ayuda?{" "}
                  <a href="mailto:contacto@anaspastryshop.com" style="color:${ACCENT};font-weight:700;text-decoration:underline;">Escríbenos &rarr;</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: config.subject || `Pago no validado — Ana's Pastry Shop`,
      html: buildEmail(
        config.preheader ||
          `${firstName}, no pudimos verificar tu comprobante de pago. Tienes opciones para resolverlo.`,
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendPaymentRejectedEmail error:", err);
  }
}

export async function sendNewsletterEmail(
  email: string,
  name: string | null,
  subject: string,
  title: string,
  preheaderText: string,
  htmlContent: string,
  unsubscribeToken: string,
) {
  const firstName = name?.split(" ")[0] ?? "Hola";
  const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`;

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARK_LIGHT} 100%);padding:36px 40px;text-align:center;">
          <p style="margin:0 0 4px;font-size:9px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${ACCENT};">Ana's Pastry Shop &middot; Atelier de Pastelería</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;line-height:1.2;">${title}</h1>
        </td>
      </tr>
      <tr><td style="height:3px;background:${ACCENT};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.4;font-weight:500;">Hola ${firstName},</p>
          <div style="font-size:15px;color:#374151;line-height:1.8;">
            ${htmlContent}
          </div>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:36px;">
            <tr>
              <td style="height:1px;background:linear-gradient(90deg,transparent,${ACCENT}50,transparent);"></td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:24px;">
            <tr>
              <td align="center">
                <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                  Estás recibiendo este newsletter porque te suscribiste a novedades de Ana's Pastry Shop.<br>
                  <a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;font-weight:600;">Cancelar suscripción</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject,
      html: buildEmail(preheaderText, body),
    });
  } catch (err) {
    console.error("[Resend] sendNewsletterEmail error:", err);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetUrl: string,
) {
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO -->
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARK_LIGHT} 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">🔐</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">Restablecer Contraseña</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);font-weight:500;">Tu solicitud de seguridad en Ana's Pastry Shop</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${ACCENT};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, recibimos una solicitud para restablecer la contraseña de tu cuenta en
            <strong style="color:${BRAND_DARK};font-weight:800;">Ana's Pastry Shop</strong>.
          </p>

          <p style="margin:0 0 28px;font-size:14px;color:#374151;line-height:1.7;">
            Haz clic en el botón a continuación para crear una nueva contraseña. Este enlace es válido
            por <strong>1 hora</strong>.
          </p>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(resetUrl, "Restablecer mi Contraseña")}
              </td>
            </tr>
          </table>

          <!-- SECURITY NOTE -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-left:4px solid ${ACCENT};background:${CREAM};border:1px solid ${CREAM_DARK};border-left-width:4px;border-radius:0 12px 12px 0;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${ACCENT};">Nota de seguridad</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                  Si no solicitaste este cambio, puedes ignorar este correo tranquilamente. Tu contraseña no será modificada.
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
                  ¿Tienes problemas con el botón? Copia y pega este enlace en tu navegador:<br>
                  <a href="${resetUrl}" style="color:${ACCENT};font-weight:600;text-decoration:underline;word-break:break-all;">${resetUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject: "Restablecer contraseña — Ana's Pastry Shop",
      html: buildEmail(
        "Restablece tu contraseña de Ana's Pastry Shop. El enlace expira en 1 hora.",
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendPasswordResetEmail error:", err);
  }
}

export async function sendCoursePurchaseEmail(
  email: string,
  name: string | null,
  courseTitle: string,
) {
  const config = await getTemplateConfig("COURSE_PURCHASE");
  if (!config.isEnabled) return;
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO -->
      <tr>
        <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARK_LIGHT} 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">🧁</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">¡Inscripción Confirmada!</h1>
          <p style="margin:0;font-size:13px;color:${ACCENT};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Acceso Inmediato</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${ACCENT};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, tu lugar ha sido asegurado y ya tienes acceso al contenido de:
          </p>

          <!-- COURSE CARD -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-radius:16px;overflow:hidden;border:1px solid ${CREAM_DARK};">
            <tr>
              <td style="height:6px;background:${ACCENT};"></td>
            </tr>
            <tr>
              <td style="padding:28px 28px 24px;background:${WHITE};">
                ${label("Formación adquirida")}
                <h2 style="margin:8px 0 16px;font-size:20px;font-weight:900;color:${BRAND_DARK};letter-spacing:-0.02em;line-height:1.2;">${courseTitle}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-right:16px;">
                      ${badge("Acceso Habilitado", "#dcfce7", "#15803d")}
                    </td>
                    <td>
                      ${badge("Formación Oficial", "rgba(217,32,128,0.12)", ACCENT)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:${CREAM};border-top:1px solid ${CREAM_DARK};">
                <p style="margin:0;font-size:12px;color:${MUTED};font-weight:500;line-height:1.5;">
                  Puedes acceder a tus lecciones y materiales desde tu panel en cualquier momento.
                </p>
              </td>
            </tr>
          </table>

          <!-- TIPS -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:${CREAM};border:1px solid ${CREAM_DARK};border-radius:16px;">
            <tr><td style="padding:20px 20px 0;">${label("Recomendaciones para aprovechar tu clase")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("📝", "Revisa el recetario e insumos con anticipación")}
                ${featureRow("🥣", "Ten tus ingredientes pesados y organizados (mise en place)")}
                ${featureRow("💬", "Anota tus dudas para consultarlas en el grupo")}
              </table>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/cursos`, "Ir al Curso Ahora")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <p style="margin:0;font-size:12px;color:${MUTED};font-weight:500;">
                  ¿Te interesa un workshop presencial en sede?{" "}
                  <a href="${BASE_URL}/workshops" style="color:${ACCENT};font-weight:700;text-decoration:underline;">Ver cartelera de workshops &rarr;</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: email,
      subject:
        config.subject ||
        `Acceso activado: ${courseTitle} — Ana's Pastry Shop`,
      html: buildEmail(
        config.preheader ||
          `${firstName}, tu acceso a "${courseTitle}" está listo. ¡Empieza ahora!`,
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendCoursePurchaseEmail error:", err);
  }
}

export async function sendAdminNewUserEmail(
  userName: string,
  userEmail: string,
  role: string,
) {
  const config = await getTemplateConfig("ADMIN_NEW_USER");
  if (!config.isEnabled) return;

  const admins = await (prisma as any).user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  const adminEmails = admins.map((a: any) => a.email).filter(Boolean);
  if (adminEmails.length === 0) return;

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding:40px;text-align:center;background-color:${WHITE};">
          <h1 style="margin:0 0 20px;font-size:24px;color:${BRAND_DARK};">${config.title || "Nuevo Usuario Registrado"}</h1>
          <p style="margin:0 0 30px;font-size:16px;color:${MUTED};">Un nuevo alumno o cliente se ha registrado en Ana's Pastry Shop.</p>
          <div style="background-color:${CREAM};border:1px solid ${CREAM_DARK};padding:20px;border-radius:12px;text-align:left;margin-bottom:30px;">
            <p style="margin:0 0 10px;font-size:14px;color:${BRAND_DARK};"><strong>Nombre:</strong> ${userName}</p>
            <p style="margin:0 0 10px;font-size:14px;color:${BRAND_DARK};"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin:0;font-size:14px;color:${BRAND_DARK};"><strong>Rol:</strong> ${role}</p>
          </div>
          ${ctaButtonGold(`${BASE_URL}/dashboard/usuarios`, "Ver Usuarios")}
        </td>
      </tr>
    </table>
  `;

  try {
    await getResend().emails.send({
      from: FROM,
      to: adminEmails,
      subject:
        config.subject ||
        "Notificación: Nuevo Registro en Ana's Pastry Shop",
      html: buildEmail(
        config.preheader || `Nuevo usuario registrado: ${userName}`,
        body,
      ),
    });
  } catch (err) {
    console.error("[Resend] sendAdminNewUserEmail error:", err);
  }
}


