import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "Academia Credito USA <noreply@academiacreditousa.com>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://academiacreditousa.com";

const LOGO_URL = `${BASE_URL}/logo_II.png`;

const NAVY = "#0B1F3A";
const GOLD = "#C9A84C";
const CREAM = "#F8F4EE";
const CREAM_DARK = "#F0EBD8";
const WHITE = "#ffffff";
const MUTED = "#6b7280";
const NAVY_LIGHT = "#1A3A5C";

function buildEmail(preheader: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Academia Crédito USA</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${CREAM}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${CREAM};font-family:'Inter',Arial,sans-serif;">

  <div class="preheader" style="font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${CREAM};">
    <tr>
      <td align="center" style="padding: 40px 16px 48px;">

        <!-- OUTER WRAPPER -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;width:100%;">

          <!-- GOLD ACCENT BAR TOP -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${GOLD} 0%,#E8C97A 50%,${GOLD} 100%);border-radius:4px 4px 0 0;"></td>
          </tr>

          <!-- HEADER: NAVY BACKGROUND -->
          <tr>
            <td style="background-color:${NAVY};padding:32px 40px 28px;border-radius:0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Logo text fallback -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color:${GOLD};width:3px;border-radius:2px;">&nbsp;</td>
                        <td style="padding-left:12px;">
                          <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};line-height:1.2;">Academia</p>
                          <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:-0.02em;color:${WHITE};line-height:1.2;">Crédito USA</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.35);">academiacreditousa.com</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background-color:${WHITE};padding:0 40px 40px;border-radius:0 0 24px 24px;border:1px solid #e5e7eb;border-top:none;">
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
                        <td style="padding:0 12px;border-right:1px solid #d1d5db;">
                          <a href="${BASE_URL}/cursos" style="font-size:11px;font-weight:600;color:${MUTED};text-decoration:none;">Cursos</a>
                        </td>
                        <td style="padding:0 12px;border-right:1px solid #d1d5db;">
                          <a href="${BASE_URL}/membresia" style="font-size:11px;font-weight:600;color:${MUTED};text-decoration:none;">Membresía</a>
                        </td>
                        <td style="padding:0 12px;">
                          <a href="${BASE_URL}/dashboard" style="font-size:11px;font-weight:600;color:${MUTED};text-decoration:none;">Mi Panel</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="font-size:11px;color:#9ca3af;line-height:1.6;margin:0;">
                      © ${new Date().getFullYear()} Academia Crédito USA. Todos los derechos reservados.<br>
                      Estás recibiendo este correo porque tienes una cuenta en nuestra plataforma.
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

function goldDivider(): string {
  return `<tr>
    <td style="height:1px;background:linear-gradient(90deg,transparent,${GOLD}60,transparent);margin:0;padding:0;"></td>
  </tr>`;
}

function label(text: string): string {
  return `<p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${GOLD};">${text}</p>`;
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${color};font-size:9px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;padding:4px 12px;border-radius:20px;">${text}</span>`;
}

function ctaButton(href: string, text: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius:50px;background-color:${NAVY};">
        <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${WHITE};text-decoration:none;border-radius:50px;">${text} &rarr;</a>
      </td>
    </tr>
  </table>`;
}

function ctaButtonGold(href: string, text: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius:50px;background-color:${GOLD};">
        <a href="${href}" style="display:inline-block;padding:16px 36px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${NAVY};text-decoration:none;border-radius:50px;">${text} &rarr;</a>
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
            <div style="width:20px;height:20px;background-color:rgba(201,168,76,0.12);border-radius:50%;text-align:center;line-height:20px;font-size:11px;">${icon}</div>
          </td>
          <td style="font-size:13px;color:#374151;font-weight:500;padding-left:10px;line-height:1.5;">${text}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export async function sendWelcomeEmail(email: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <!-- DECORATIVE TOP SECTION -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background:linear-gradient(135deg,${NAVY} 0%,${NAVY_LIGHT} 100%);padding:40px;margin:-1px -1px 0;border-radius:0;text-align:center;">
          <p style="margin:0 0 12px;font-size:36px;">👋</p>
          <h1 style="margin:0;font-size:28px;font-weight:900;color:${WHITE};letter-spacing:-0.03em;line-height:1.1;">
            Hola, ${firstName}
          </h1>
          <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.6);font-weight:500;">Bienvenido a la Academia Crédito USA</p>
        </td>
      </tr>

      <!-- GOLD STRIPE -->
      <tr>
        <td style="height:3px;background:${GOLD};"></td>
      </tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;font-weight:400;">
            Tu cuenta ha sido creada exitosamente. Ahora formas parte de una comunidad dedicada a dominar el
            sistema crediticio americano y construir un futuro financiero sólido.
          </p>

          <!-- FEATURE LIST -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border:1px solid #f0ebdc;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 20px 0;background-color:${CREAM};">
                ${label("Con tu cuenta puedes")}
              </td>
            </tr>
            <tr><td style="padding:0 20px;background-color:${CREAM};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("→", "Explorar todos los cursos disponibles en la plataforma")}
                ${featureRow("→", "Activar tu membresía y desbloquear acceso completo")}
                ${featureRow("→", "Acceder a sesiones en vivo con Rami Noureddine")}
                ${featureRow("→", "Unirte a la comunidad activa de miembros")}
              </table>
            </td></tr>
            <tr><td style="height:16px;background-color:${CREAM};"></td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:20px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/checkout/membresia`, "Activar mi Membresía")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <a href="${BASE_URL}/cursos" style="font-size:12px;font-weight:700;color:${MUTED};text-decoration:underline;letter-spacing:0.05em;">
                  Explorar cursos primero →
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
      subject: `Bienvenido a Academia Crédito USA — Hola, ${firstName}`,
      html: buildEmail(`Bienvenido ${firstName}, tu cuenta está lista. Empieza hoy.`, body),
    });
  } catch (err) {
    console.error("[Resend] sendWelcomeEmail error:", err);
  }
}

export async function sendSubscriptionConfirmedEmail(
  email: string,
  name: string | null,
  planName: string,
  amountPaid: number
) {
  const firstName = name?.split(" ")[0] ?? "allí";
  const dateStr = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO: SUCCESS STATE -->
      <tr>
        <td style="background:linear-gradient(135deg,${NAVY} 0%,${NAVY_LIGHT} 100%);padding:40px;text-align:center;">
          <!-- Checkmark icon -->
          <div style="width:64px;height:64px;background:rgba(201,168,76,0.2);border:2px solid ${GOLD};border-radius:50%;margin:0 auto 20px;text-align:center;line-height:60px;font-size:28px;">✓</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">¡Membresía Activada!</h1>
          <p style="margin:0;font-size:13px;color:${GOLD};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Acceso Completo Desbloqueado</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${GOLD};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, tu membresía en <strong style="color:${NAVY};font-weight:800;">Academia Crédito USA</strong> está
            activa. Ya tienes acceso completo a todos los cursos, sesiones en vivo y material exclusivo.
          </p>

          <!-- RECEIPT BOX -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:16px 24px;background-color:${NAVY};">
                ${label("<span style='color:rgba(255,255,255,0.5);'>Detalle del Pago</span>")}
              </td>
            </tr>
            <tr>
              <td style="padding:0;background:${WHITE};">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">Plan</td>
                          <td align="right" style="font-size:13px;font-weight:700;color:${NAVY};">${planName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">Monto</td>
                          <td align="right" style="font-size:18px;font-weight:900;color:${GOLD};">$${amountPaid} <span style="font-size:12px;font-weight:600;color:${MUTED};">USD / mes</span></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">Fecha</td>
                          <td align="right" style="font-size:13px;font-weight:700;color:${NAVY};">${dateStr}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="font-size:12px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:0.08em;">Estado</td>
                          <td align="right">${badge("Activo", "#dcfce7", "#15803d")}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- WHAT'S INCLUDED -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:${CREAM};border-radius:16px;overflow:hidden;">
            <tr><td style="padding:20px 20px 0;">${label("Lo que tienes disponible ahora")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("📚", "Acceso a todos los cursos de la plataforma")}
                ${featureRow("🎙️", "Sesiones en vivo con Rami Noureddine")}
                ${featureRow("📈", "Estrategias actualizadas mes a mes")}
                ${featureRow("👥", "Comunidad activa de miembros")}
              </table>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/cursos`, "Empezar a Aprender")}
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
      subject: `¡Tu membresía está activa! — Academia Crédito USA`,
      html: buildEmail(`Hola ${firstName}, tu acceso a ${planName} ha sido activado. ¡Empieza hoy!`, body),
    });
  } catch (err) {
    console.error("[Resend] sendSubscriptionConfirmedEmail error:", err);
  }
}

export async function sendSubscriptionCanceledEmail(email: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO -->
      <tr>
        <td style="background:linear-gradient(135deg,#1a1a2e 0%,${NAVY} 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">💳</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">Membresía Cancelada</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);font-weight:500;">Lamentamos verte partir, ${firstName}</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${GOLD};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
            Tu membresía en <strong style="color:${NAVY};font-weight:800;">Academia Crédito USA</strong> ha sido cancelada.
            Tu acceso permanecerá activo hasta el final del período ya pagado.
          </p>

          <!-- INFO BOX -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-left:4px solid ${GOLD};background:${CREAM};border-radius:0 12px 12px 0;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};">Recuerda</p>
                <p style="margin:0;font-size:14px;color:${NAVY};line-height:1.6;font-weight:500;">
                  Puedes reactivar tu membresía en cualquier momento y retomar exactamente donde la dejaste.
                  Todo tu progreso está guardado.
                </p>
              </td>
            </tr>
          </table>

          <!-- WHAT YOU'LL LOSE -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:#fafafa;border:1px solid #e5e7eb;border-radius:16px;">
            <tr><td style="padding:20px 20px 0;">${label("Al cancelar perderás acceso a")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("📚", "Todos los cursos de la plataforma")}
                ${featureRow("🎙️", "Sesiones en vivo mensuales")}
                ${featureRow("📊", "Actualizaciones y nuevo contenido")}
              </table>
            </td></tr>
            <tr><td style="height:16px;"></td></tr>
          </table>

          <!-- CTA REACTIVAR -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:16px;">
            <tr>
              <td align="center">
                ${ctaButtonGold(`${BASE_URL}/checkout/membresia`, "Reactivar Membresía")}
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                <a href="${BASE_URL}/cursos" style="font-size:12px;font-weight:600;color:${MUTED};text-decoration:underline;">Ver cursos disponibles →</a>
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
      subject: `Tu membresía ha sido cancelada — Academia Crédito USA`,
      html: buildEmail(`Hola ${firstName}, tu membresía fue cancelada. Puedes reactivarla cuando quieras.`, body),
    });
  } catch (err) {
    console.error("[Resend] sendSubscriptionCanceledEmail error:", err);
  }
}

export async function sendSubscriptionPendingEmail(email: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO -->
      <tr>
        <td style="background:linear-gradient(135deg,${NAVY} 0%,${NAVY_LIGHT} 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">📩</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">Pago Recibido</h1>
          <p style="margin:0;font-size:13px;color:${GOLD};font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">En Revisión</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${GOLD};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, hemos recibido tu solicitud de membresía. Nuestro equipo está
            verificando tu transferencia bancaria.
          </p>

          <!-- STEPS -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
            <tr>
              <td>
                ${label("Proceso de activación")}
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:12px;">
                  <!-- STEP 1 DONE -->
                  <tr>
                    <td width="36" style="vertical-align:top;padding-top:2px;">
                      <div style="width:28px;height:28px;background:${GOLD};border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:900;color:${NAVY};">1</div>
                    </td>
                    <td style="padding-bottom:20px;padding-left:12px;">
                      <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:${NAVY};">Pago enviado</p>
                      <p style="margin:0;font-size:12px;color:#16a34a;font-weight:600;">✓ Completado</p>
                    </td>
                  </tr>
                  <!-- STEP 2 IN PROGRESS -->
                  <tr>
                    <td width="36" style="vertical-align:top;padding-top:2px;">
                      <div style="width:28px;height:28px;background:${CREAM_DARK};border:2px solid ${GOLD};border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:900;color:${GOLD};">2</div>
                    </td>
                    <td style="padding-bottom:20px;padding-left:12px;">
                      <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:${NAVY};">Verificación del equipo</p>
                      <p style="margin:0;font-size:12px;color:${GOLD};font-weight:600;">⏳ En proceso (menos de 24h)</p>
                    </td>
                  </tr>
                  <!-- STEP 3 PENDING -->
                  <tr>
                    <td width="36" style="vertical-align:top;padding-top:2px;">
                      <div style="width:28px;height:28px;background:#f3f4f6;border:2px solid #d1d5db;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:900;color:#9ca3af;">3</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#9ca3af;">Membresía activada</p>
                      <p style="margin:0;font-size:12px;color:#9ca3af;font-weight:500;">Pendiente de verificación</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- NOTE -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:${CREAM};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${GOLD};">Próximo paso</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-weight:500;">
                  Recibirás otro email de confirmación en cuanto tu membresía sea activada.
                  Si tienes alguna pregunta, escríbenos a tu email de contacto.
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                ${ctaButton(`${BASE_URL}/dashboard`, "Ver mi Panel")}
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
      subject: `Pago recibido, en revisión — Academia Crédito USA`,
      html: buildEmail(`${firstName}, recibimos tu pago. Te notificaremos cuando tu membresía esté activa.`, body),
    });
  } catch (err) {
    console.error("[Resend] sendSubscriptionPendingEmail error:", err);
  }
}

export async function sendCoursePurchaseEmail(email: string, name: string | null, courseTitle: string) {
  const firstName = name?.split(" ")[0] ?? "allí";

  const body = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">

      <!-- HERO -->
      <tr>
        <td style="background:linear-gradient(135deg,${NAVY} 0%,${NAVY_LIGHT} 100%);padding:40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:40px;">🎓</p>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:${WHITE};letter-spacing:-0.02em;">¡Acceso Activado!</h1>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);font-weight:500;">Tu curso está listo para comenzar</p>
        </td>
      </tr>
      <tr><td style="height:3px;background:${GOLD};"></td></tr>

      <tr>
        <td style="padding:36px 0 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
            Hola ${firstName}, ya tienes acceso completo al siguiente curso:
          </p>

          <!-- COURSE CARD -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="height:6px;background:${GOLD};"></td>
            </tr>
            <tr>
              <td style="padding:28px 28px 24px;background:${WHITE};">
                ${label("Curso adquirido")}
                <h2 style="margin:8px 0 16px;font-size:20px;font-weight:900;color:${NAVY};letter-spacing:-0.02em;line-height:1.2;">${courseTitle}</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding-right:16px;">
                      ${badge("Acceso Inmediato", "#dcfce7", "#15803d")}
                    </td>
                    <td>
                      ${badge("De por vida", `rgba(201,168,76,0.12)`, GOLD)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:${CREAM};border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:12px;color:${MUTED};font-weight:500;line-height:1.5;">
                  Puedes acceder al curso desde tu panel en cualquier momento, en cualquier dispositivo.
                </p>
              </td>
            </tr>
          </table>

          <!-- TIPS -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;background:#fafafa;border:1px solid #e5e7eb;border-radius:16px;">
            <tr><td style="padding:20px 20px 0;">${label("Tips para empezar")}</td></tr>
            <tr><td style="padding:0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${featureRow("📝", "Revisa el temario completo antes de empezar")}
                ${featureRow("⏱️", "Dedica al menos 30 minutos diarios al contenido")}
                ${featureRow("💬", "Participa en la comunidad para resolver dudas")}
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
                  ¿Quieres acceso a todos los cursos?{" "}
                  <a href="${BASE_URL}/checkout/membresia" style="color:${GOLD};font-weight:700;text-decoration:underline;">Ver membresía completa →</a>
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
      subject: `Acceso activado: ${courseTitle} — Academia Crédito USA`,
      html: buildEmail(`${firstName}, tu acceso al curso "${courseTitle}" está listo. ¡Empieza ahora!`, body),
    });
  } catch (err) {
    console.error("[Resend] sendCoursePurchaseEmail error:", err);
  }
}
