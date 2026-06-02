import type { FC, ReactNode } from "react";
import { pill } from "../../styles/shared";
import type { BadgeColor } from "../../types";

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
}

const Badge: FC<BadgeProps> = ({ children, color = "green" }) => (
  <span style={pill(color)}>{children}</span>
);

export default Badge;
