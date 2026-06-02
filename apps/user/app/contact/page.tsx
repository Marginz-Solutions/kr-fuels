import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { getContact, getSiteSettings } from "@/lib/api";
import { ContactForm } from "@/components/ContactForm";
import { BRAND, formatAddress, getCoords } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with K.R Trans Fuels — phone, email, address and enquiry form.",
};

// ISR: contact details rarely change — long cache, background refresh.
export const revalidate = 300;

export default async function ContactPage() {
  const [contact, site] = await Promise.all([getContact(), getSiteSettings()]);
  const socials = Object.entries(site.social ?? {}).filter(([, url]) => !!url) as [string, string][];

  const companyName = contact.essentials?.companyName || BRAND.name;
  const email = contact.essentials?.emails?.info || BRAND.email;
  const phone = contact.essentials?.phoneNos?.office || BRAND.phone;
  const whatsapp = contact.essentials?.phoneNos?.whatsapp;
  const address = formatAddress(contact.presents?.address);
  const hours = contact.presents?.workingHours || "Mon–Sat, 9:00 AM – 8:00 PM";
  const coords = getCoords(contact.presents);
  const mapQuery = coords
    ? `${coords.latitude},${coords.longitude}`
    : `${companyName}, ${address}`;
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;

  return (
    <>
      <section className="bg-linear-to-b from-brand-pale/60 to-white">
        <div className="container-x py-14 text-center">
          <span className="eyebrow mb-4">Contact</span>
          <h1 className="text-4xl font-extrabold text-ink sm:text-5xl">We'd Love to Hear From You</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mutedfg">
            Questions about Auto LPG, stations or conversions? Reach out — we're here to help.
          </p>
        </div>
      </section>

      <section className="container-x grid gap-8 py-16 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { icon: MapPin, label: "Address", value: address },
              { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
              { icon: Phone, label: "Phone", value: phone, href: `tel:${phone}` },
              ...(whatsapp ? [{ icon: Phone, label: "WhatsApp", value: whatsapp, href: `tel:${whatsapp}` }] : []),
              { icon: Clock, label: "Hours", value: hours },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4 card-soft">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-pale text-brand"><c.icon size={20} /></span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-mutedfg">{c.label}</div>
                  {c.href ? (
                    <Link href={c.href} className="font-medium text-ink hover:text-brand">{c.value}</Link>
                  ) : (
                    <div className="font-medium text-ink">{c.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-line">
            <iframe
              title={`${companyName} location`}
              src={mapSrc}
              className="h-72 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {socials.length > 0 && (
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-mutedfg">Follow us</div>
              <div className="flex flex-wrap gap-3">
                {socials.map(([key, url]) => (
                  <Link key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-brand-pale px-4 py-2.5 text-sm font-semibold capitalize text-brand transition hover:bg-brand hover:text-white">
                    {key}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <ContactForm />
      </section>
    </>
  );
}
