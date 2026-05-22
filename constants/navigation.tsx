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
} from "lucide-react";
import type { NavItem } from "../types";

export const NAV: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",             icon: LayoutDashboard },
  { id: "testimonials", label: "Testimonials",           icon: MessageSquare   },
  { id: "clients",      label: "Clients / Collaborators",icon: Users           },
  { id: "stations",     label: "Auto LPG Stations",      icon: MapPin          },
  { id: "products",     label: "Products",               icon: Package         },
  { id: "faq",          label: "FAQ",                    icon: HelpCircle      },
  { id: "contact",      label: "Contact & Forms",        icon: Phone           },
  { id: "settings",     label: "Website Settings",       icon: Settings        },
  { id: "profile",      label: "Admin Profile",          icon: User            },
];
