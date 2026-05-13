import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const NAVY = "#0B1F3A";
export const GOLD = "#C9A84C";
export const CREAM = "#F8F4EE";
export const CREAM_DARK = "#F0EBD8";
export const WHITE = "#ffffff";
export const MUTED = "#6b7280";
export const NAVY_LIGHT = "#1A3A5C";
export const BASE_URL =
  process.env.NEXTAUTH_URL ?? "https://academiacreditousa.com";

export default function EmailLayout({
  preheader,
  children,
}: {
  preheader: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preheader}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: CREAM,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "40px auto",
            padding: "0 16px 48px",
          }}
        >
          <Section
            style={{
              height: "4px",
              background: `linear-gradient(90deg, ${GOLD} 0%, #E8C97A 50%, ${GOLD} 100%)`,
              borderRadius: "4px 4px 0 0",
            }}
          />

          <Section style={{ backgroundColor: NAVY, padding: "28px 40px" }}>
            <Row>
              <Column>
                <table
                  cellPadding="0"
                  cellSpacing="0"
                  style={{ borderCollapse: "collapse" }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          backgroundColor: GOLD,
                          width: "3px",
                          borderRadius: "2px",
                        }}
                      >
                        &nbsp;
                      </td>
                      <td style={{ paddingLeft: "12px" }}>
                        <Text
                          style={{
                            margin: 0,
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: GOLD,
                            lineHeight: "1.2",
                          }}
                        >
                          Academia
                        </Text>
                        <Text
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 900,
                            letterSpacing: "-0.02em",
                            color: WHITE,
                            lineHeight: "1.2",
                          }}
                        >
                          Crédito USA
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Column>
              <Column style={{ textAlign: "right", verticalAlign: "middle" }}>
                <Text
                  style={{
                    margin: 0,
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  academiacreditousa.com
                </Text>
              </Column>
            </Row>
          </Section>

          <Section
            style={{
              backgroundColor: WHITE,
              padding: "0 40px 40px",
              borderRadius: "0 0 20px 20px",
              border: "1px solid #e5e7eb",
              borderTop: "none",
            }}
          >
            {children}
          </Section>

          <Section style={{ paddingTop: "28px", textAlign: "center" }}>
            <Row>
              <Column style={{ textAlign: "center" }}>
                <Link
                  href={`${BASE_URL}/cursos`}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: MUTED,
                    textDecoration: "none",
                    padding: "0 12px",
                    borderRight: "1px solid #d1d5db",
                  }}
                >
                  Cursos
                </Link>
                <Link
                  href={`${BASE_URL}/membresia`}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: MUTED,
                    textDecoration: "none",
                    padding: "0 12px",
                    borderRight: "1px solid #d1d5db",
                  }}
                >
                  Membresía
                </Link>
                <Link
                  href={`${BASE_URL}/dashboard`}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: MUTED,
                    textDecoration: "none",
                    padding: "0 12px",
                  }}
                >
                  Mi Panel
                </Link>
              </Column>
            </Row>
            <Text
              style={{
                fontSize: "11px",
                color: "#9ca3af",
                lineHeight: "1.6",
                textAlign: "center",
                margin: "12px 0 0",
              }}
            >
              © {new Date().getFullYear()} Academia Crédito USA. Todos los
              derechos reservados.
              <br />
              Estás recibiendo este correo porque tienes una cuenta en nuestra
              plataforma.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function GoldDivider() {
  return (
    <Section
      style={{
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${GOLD}60, transparent)`,
        margin: "24px 0",
      }}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        margin: "0 0 8px",
        fontSize: "9px",
        fontWeight: 800,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: GOLD,
      }}
    >
      {children}
    </Text>
  );
}

export function CtaButton({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "navy";
}) {
  const bg = variant === "gold" ? GOLD : NAVY;
  const color = variant === "gold" ? NAVY : WHITE;
  return (
    <Section style={{ textAlign: "center", margin: "24px 0" }}>
      <Link
        href={href}
        style={{
          display: "inline-block",
          backgroundColor: bg,
          color,
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textDecoration: "none",
          padding: "16px 36px",
          borderRadius: "50px",
        }}
      >
        {children} →
      </Link>
    </Section>
  );
}

export function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <Row style={{ borderBottom: "1px solid #f3f4f6", padding: "10px 0" }}>
      <Column
        style={{ width: "32px", verticalAlign: "top", paddingTop: "2px" }}
      >
        <Text
          style={{
            margin: 0,
            fontSize: "14px",
            width: "24px",
            height: "24px",
            lineHeight: "24px",
            textAlign: "center",
            backgroundColor: "rgba(201,168,76,0.12)",
            borderRadius: "50%",
          }}
        >
          {icon}
        </Text>
      </Column>
      <Column style={{ paddingLeft: "10px", verticalAlign: "top" }}>
        <Text
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#374151",
            fontWeight: 500,
            lineHeight: "1.5",
          }}
        >
          {text}
        </Text>
      </Column>
    </Row>
  );
}

export function HeroSection({
  emoji,
  title,
  subtitle,
  badgeText,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  badgeText?: string;
}) {
  return (
    <Section
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        padding: "40px",
        textAlign: "center",
        margin: "0 -40px",
      }}
    >
      {emoji && (
        <Text style={{ margin: "0 0 12px", fontSize: "40px", lineHeight: 1 }}>
          {emoji}
        </Text>
      )}
      <Text
        style={{
          margin: "0 0 8px",
          fontSize: "26px",
          fontWeight: 900,
          color: WHITE,
          letterSpacing: "-0.02em",
          lineHeight: "1.2",
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            margin: 0,
            fontSize: "13px",
            color: badgeText ? GOLD : "rgba(255,255,255,0.6)",
            fontWeight: badgeText ? 700 : 500,
            letterSpacing: badgeText ? "0.1em" : undefined,
            textTransform: badgeText ? "uppercase" : undefined,
          }}
        >
          {subtitle}
        </Text>
      )}
      <Section style={{ height: "3px", backgroundColor: GOLD, margin: 0 }} />
    </Section>
  );
}
