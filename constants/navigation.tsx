import {
  LayoutDashboard,
  MessageSquare,
  Users,
  MapPin,
  Package,
  HelpCircle,
  Phone,
  Settings,
  User,
  Star,
  Mail,
  Lock,
} from "lucide-react";
import type { NavItem } from "../types";

export const NAV = [
  { id: "dashboard",    label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { id: "clients",      label: "Clients",      href: "/clients",      icon: Users },
  { id: "stations",     label: "Stations",     href: "/stations",     icon: MapPin },
  { id: "testimonials", label: "Testimonials", href: "/testimonials", icon: Star },
  { id: "faq",          label: "FAQ",          href: "/faq",          icon: HelpCircle },
  { id: "contact",      label: "Contact",      href: "/contact",      icon: Mail },
  { id: "seo-settings", label: "SEO Settings", href: "/seo-settings", icon: Settings },
  { id: "privacy-policy", label: "Privacy Policy", href: "/privacy-policy", icon: Lock },
];