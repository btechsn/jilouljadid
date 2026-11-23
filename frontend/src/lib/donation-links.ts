/**
 * Liens de don externes (Payment Link Stripe / PayPal, lien Wave / Wallet Money).
 * Si vides, l’UI renvoie vers /soutien pour le formulaire interne.
 */
export const STRIPE_DONATION_URL = (process.env.NEXT_PUBLIC_STRIPE_DONATION_URL || "").trim();
export const PAYPAL_DONATION_URL = (process.env.NEXT_PUBLIC_PAYPAL_DONATION_URL || "").trim();
export const WALLET_DONATION_URL = (process.env.NEXT_PUBLIC_WALLET_DONATION_URL || "").trim();

export function stripeDonateHref(locale: string): string {
  return STRIPE_DONATION_URL || `/${locale}/soutien?method=stripe`;
}

export function paypalDonateHref(locale: string): string {
  return PAYPAL_DONATION_URL || `/${locale}/soutien?method=paypal`;
}

export function walletDonateHref(locale: string): string {
  return WALLET_DONATION_URL || `/${locale}/soutien?method=wallet`;
}

export function isExternalDonateHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
