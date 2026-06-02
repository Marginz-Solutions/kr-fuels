"use client";

import type { ReactNode } from "react";
import { ConfigProvider } from "antd";

/**
 * Re-themes Ant Design to the shared visual language: brand teal primary,
 * rounded corners, Plus Jakarta Sans, and the neutral palette used across
 * the admin. Tables / inputs / modals / spinners inherit these tokens.
 * (#285a4c ≈ oklch(0.43 0.06 172.08), our brand teal.)
 */
export default function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#285a4c",
          colorLink: "#285a4c",
          colorLinkHover: "#1c4338",
          borderRadius: 12,
          colorBgContainer: "#ffffff",
          colorBorder: "#e2e8f0",
          colorBorderSecondary: "#eef2f0",
          colorText: "#1a2e29",
          colorTextSecondary: "#5a7872",
          fontFamily:
            "var(--font-plus-jakarta), 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Button: { borderRadius: 9999, fontWeight: 600 },
          Modal: { borderRadiusLG: 20 },
          Card: { borderRadiusLG: 20 },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
