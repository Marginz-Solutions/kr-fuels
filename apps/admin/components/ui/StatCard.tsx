"use client";
import type { FC, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { card } from "../../styles/shared";
import { C } from "../../constants/colors";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  /** When set, the whole card becomes a link to this route. */
  href?: string;
  /** When set, the whole card becomes clickable. */
  onClick?: () => void;
}

const StatCard: FC<StatCardProps> = ({ icon, label, value, sub, color = C.t, href, onClick }) => {
  const [hover, setHover] = useState(false);
  const clickable = Boolean(href || onClick);

  const inner = (
    <div
      onMouseEnter={() => clickable && setHover(true)}
      onMouseLeave={() => clickable && setHover(false)}
      style={{
        ...card(),
        padding: 22,
        cursor: clickable ? "pointer" : "default",
        transition: "box-shadow 0.15s, transform 0.15s, border-color 0.15s",
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover ? "0 10px 28px rgba(26,46,41,0.10)" : undefined,
        borderColor: hover ? C.p : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: C.tm, marginBottom: 6, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: C.t, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: C.tm, marginTop: 4 }}>{sub}</div>}
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.white,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0}>
        {inner}
      </div>
    );
  }

  return inner;
};

export default StatCard;
