// ─── TestimonialAvatar ────────────────────────────────────────────────────────
// Shows the customer photo if available; falls back to a styled monogram.

"use client";
import { FC, useState } from "react";
import Image from "next/image";
import { avatarGradient, initialsFromName } from "@/lib/avatarColor";

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

const TestimonialAvatar: FC<AvatarProps> = ({ name, image, size = "md" }) => {
  const [imgError, setImgError] = useState(false);
  const { container, text } = SIZE_MAP[size];
  const initials = initialsFromName(name);
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
          style={avatarGradient(name)}
        >
          {initials}
        </div>
      )}
    </div>
  );
};

export default TestimonialAvatar;