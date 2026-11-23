"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { PageHeading } from "@/components/layout/page-heading";
import { api } from "@/lib/api";
import { fetchApiJson } from "@/lib/api-fetch";
import {
  isExternalDonateHref,
  PAYPAL_DONATION_URL,
  STRIPE_DONATION_URL,
  WALLET_DONATION_URL,
} from "@/lib/donation-links";
import { cn } from "@/lib/utils";

const FIELD =
  "h-11 w-full rounded-xl border border-black/10 bg-[#f8f9fa] px-3 text-sm text-content outline-none transition placeholder:text-content-secondary/70 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50";

type Donor = {
  name?: string | null;
  is_anonymous?: boolean;
  amount_minor?: number | null;
  currency?: string;
  paid_at?: string | null;
};

type DonateMethod = "stripe" | "paypal" | "wave" | "orange_money";

const PAY_METHODS: DonateMethod[] = ["stripe", "paypal", "orange_money", "wave"];

const PAY_ICONS: Record<DonateMethod, string> = {
  stripe: "/brand/payments/stripe.png",
  paypal: "/brand/payments/paypal.png",
  wave: "/brand/payments/wave.png",
  orange_money: "/brand/payments/orange-money.png",
};

function money(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(amount);
}

function resolveInitialMethod(raw: string | null): DonateMethod {
  if (raw === "wallet" || raw === "wave") return "wave";
  if (raw === "orange_money") return "orange_money";
  if (raw === "paypal") return "paypal";
  if (raw === "stripe") return "stripe";
  return "stripe";
}

function externalUrlFor(method: DonateMethod): string {
  if (method === "stripe") return STRIPE_DONATION_URL;
  if (method === "paypal") return PAYPAL_DONATION_URL;
  return WALLET_DONATION_URL;
}

/** Méthode envoyée à l’API (paypal n’est pas encore une passerelle backend). */
function apiMethodFor(method: DonateMethod): "stripe" | "wave" | "orange_money" | "bank_transfer" {
  if (method === "paypal") return "bank_transfer";
  return method;
}

export function SupportBoard() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations("support");
  const pages = useTranslations("pages.support");

  const [donors, setDonors] = useState<Donor[]>([]);
  const [donorName, setDonorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [amount, setAmount] = useState("5000");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState<DonateMethod>(() =>
    resolveInitialMethod(searchParams.get("method")),
  );
  const [donateBusy, setDonateBusy] = useState(false);
  const [donateStatus, setDonateStatus] = useState<"idle" | "ok" | "error">("idle");
  const [donateError, setDonateError] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");

  useEffect(() => {
    setMethod(resolveInitialMethod(searchParams.get("method")));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const donorBody = await fetchApiJson("/community/donors");
      if (cancelled) return;
      setDonors(Array.isArray(donorBody) ? (donorBody as Donor[]) : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [donateStatus]);

  useEffect(() => {
    if (checkoutUrl && isExternalDonateHref(checkoutUrl)) {
      window.location.assign(checkoutUrl);
    }
  }, [checkoutUrl]);

  const selectMethod = (next: DonateMethod) => {
    setMethod(next);
  };

  const submitDonation = async (event: FormEvent) => {
    event.preventDefault();
    setDonateBusy(true);
    setDonateStatus("idle");
    setDonateError("");
    setCheckoutUrl("");

    try {
      const external = externalUrlFor(method);
      if (external) {
        setDonateStatus("ok");
        setCheckoutUrl(external);
        window.location.assign(external);
        return;
      }

      const response = (await api.post("/community/donations", {
        donor_name: anonymous ? null : donorName.trim() || null,
        is_anonymous: anonymous,
        amount_minor: Number(amount),
        message: message.trim() || null,
        method: apiMethodFor(method),
      })) as { checkout_url?: string };
      const url = typeof response.checkout_url === "string" ? response.checkout_url : "";
      setDonateStatus("ok");
      setCheckoutUrl(url);
      if (url && isExternalDonateHref(url)) {
        window.location.assign(url);
      }
      setMessage("");
    } catch (error) {
      setDonateStatus("error");
      setDonateError(error instanceof Error ? error.message : t("donateError"));
    } finally {
      setDonateBusy(false);
    }
  };

  return (
    <article>
      <PageHeading eyebrow={pages("eyebrow")} title={pages("title")} lede={pages("lede")} image="/brand/slide-centre.jpg" />

      <section className="relative bg-[#eef1f4] py-10 sm:py-14">
        <div className="nh-container relative">
          <form
            onSubmit={submitDonation}
            className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-xl shadow-brand-950/5 ring-1 ring-black/5 sm:p-8"
          >
            <h2 className="font-sans text-2xl font-extrabold text-content">{t("donateTitle")}</h2>
            <p className="mt-2 text-sm text-content-secondary">{t("donateLede")}</p>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-content">{t("method")}</p>
              <div className="grid grid-cols-4 gap-3">
                {PAY_METHODS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectMethod(value)}
                    aria-pressed={method === value}
                    aria-label={t(`methods.${value}`)}
                    title={t(`methods.${value}`)}
                    className={cn(
                      "flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white p-2 ring-2 transition",
                      method === value
                        ? "ring-brand-800 shadow-md shadow-brand-900/10"
                        : "ring-black/5 hover:ring-brand-300",
                    )}
                  >
                    <Image
                      src={PAY_ICONS[value]}
                      alt=""
                      width={72}
                      height={72}
                      className="size-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {donateStatus === "ok" ? (
              <div className="mt-6 rounded-2xl bg-brand-50 p-5 text-sm text-brand-950">
                <p className="font-semibold">{t("donateSuccess")}</p>
                {checkoutUrl ? (
                  <a href={checkoutUrl} className="mt-3 inline-flex font-semibold underline">
                    {t("checkout")}
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-content">{t("amount")}</span>
                  <input
                    required
                    min={100}
                    step={100}
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className={cn(FIELD, "nh-numeric")}
                  />
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                  />
                  <span className="text-sm font-semibold text-content">{t("anonymous")}</span>
                </label>
                {anonymous ? null : (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-content">{t("donorName")}</span>
                    <input
                      value={donorName}
                      onChange={(event) => setDonorName(event.target.value)}
                      className={FIELD}
                      placeholder={t("donorNamePh")}
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-content">{t("note")}</span>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-black/10 bg-[#f8f9fa] px-3 py-2.5 text-sm text-content outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-gold-300/50"
                  />
                </label>
                {donateStatus === "error" ? (
                  <p className="text-sm text-red-700">{donateError || t("donateError")}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={donateBusy}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-brand-900 px-6 text-xs font-semibold uppercase tracking-wide text-white hover:bg-brand-800 disabled:opacity-60"
                >
                  {donateBusy ? t("loading") : t("donateSubmit")}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="nh-container relative mt-6">
          <section className="rounded-3xl bg-white p-6 shadow-xl shadow-brand-950/5 ring-1 ring-black/5 sm:p-8">
            <h2 className="font-sans text-2xl font-extrabold text-content">{t("wallTitle")}</h2>
            <p className="mt-2 text-sm text-content-secondary">{t("wallLede")}</p>
            {donors.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-gold-100/60 p-5 text-sm text-brand-950">{t("wallEmpty")}</p>
            ) : (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {donors.map((donor, index) => (
                  <li
                    key={`${donor.paid_at ?? "donor"}-${index}`}
                    className="rounded-2xl bg-[#f8f9fa] p-4 text-sm text-content ring-1 ring-black/5"
                  >
                    <p className="font-semibold">
                      {donor.is_anonymous || !donor.name ? t("anonymousDonor") : donor.name}
                    </p>
                    {donor.amount_minor ? (
                      <p className="mt-1 nh-numeric">{money(donor.amount_minor, locale)}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </article>
  );
}
