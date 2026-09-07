// Shared page-metadata builder — keeps <title>, meta description, og:*, and
// twitter:* in sync per page instead of every child page inheriting the
// homepage's Open Graph / Twitter card (title/description are set as
// absolute so a per-page string is never re-suffixed by the root layout's
// title template).
import type { Metadata } from "next";
import { SITE_URL, BRAND } from "./site";

const DEFAULT_OG_IMAGE = "/assets/og.jpg";

export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Pick<Metadata, "title" | "description" | "openGraph" | "twitter"> {
  const { title, description, path = "", image = DEFAULT_OG_IMAGE } = opts;

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: BRAND.name,
      images: [{ url: image, width: 1920, height: 700, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
