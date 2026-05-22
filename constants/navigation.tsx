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
} from "lucide-react";
import type { NavItem } from "../types";

export const NAV = [
  { id: "dashboard",    label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { id: "clients",      label: "Clients",      href: "/clients",      icon: Users },
  { id: "stations",     label: "Stations",     href: "/stations",     icon: MapPin },
  { id: "products",     label: "Products",     href: "/products",     icon: Package },
  { id: "testimonials", label: "Testimonials", href: "/testimonials", icon: Star },
  { id: "faq",          label: "FAQ",          href: "/faq",          icon: HelpCircle },
  { id: "contact",      label: "Contact",      href: "/contact",      icon: Mail },
  { id: "settings",     label: "Settings",     href: "/settings",     icon: Settings },
  { id: "profile",      label: "Profile",      href: "/profile",      icon: User },
];