// ─── TestimonialAvatar ────────────────────────────────────────────────────────
// Shows the customer photo if available; falls back to a styled monogram.

"use client";
import { FC, useState } from "react";
import Image from "next/image";

interface AvatarProps {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { container: "w-10 h-10", text: "text-xs" },
  md: { container: "w-12 h-12", text: "text-sm" },
  lg: { container: "w-14 h-14", text: "text-base" },
} as const;

/** Deterministic hue from the customer's name so each avatar has a consistent colour */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const TestimonialAvatar: FC<AvatarProps> = ({ name, image, size = "md" }) => {
  const [imgError, setImgError] = useState(false);
  const { container, text } = SIZE_MAP[size];
  const hue = nameToHue(name);
  const initials = getInitials(name);
  const showImage = image && !imgError;

  return (
    <div
      className={`relative ${container} rounded-full flex-shrink-0 ring-2 ring-white shadow-sm overflow-hidden`}
      aria-hidden="true"
    >
      {showImage ? (
        <Image
          src={image!}
          alt={name}
          fill
          sizes="56px"
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold ${text} text-white select-none`}
          style={{
            background: `linear-gradient(135deg, hsl(${hue},60%,52%), hsl(${(hue + 30) % 360},55%,40%))`,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

export default TestimonialAvatar;