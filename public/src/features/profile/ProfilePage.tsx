import type { FC } from "react";
import { LogOut, Save, Check } from "lucide-react";

import { C }             from "../../constants/colors";
import { card, btn, inp } from "../../styles/shared";
import { Badge, FormField } from "../../components/ui";

const ProfilePage: FC = () => (
  <div style={{ padding: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      {/* Profile card */}
      <div style={{ ...card(), padding: 24, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.p, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, margin: "0 auto 14px" }}>
          KR
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: C.t }}>KR Fuels Admin</div>
        <div style={{ fontSize: 13, color: C.tm, marginBottom: 6 }}>Super Administrator</div>
        <Badge color="green">Active</Badge>

        <div style={{ marginTop: 16, padding: "12px 0", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 12, color: C.tm }}>Last login</div>
          <div style={{ fontSize: 13, color: C.t, fontWeight: 500 }}>Today, 09:32 AM</div>
        </div>
        <div style={{ padding: "12px 0", borderTop: `1px solid ${C.bd}` }}>
          <div style={{ fontSize: 12, color: C.tm }}>Member since</div>
          <div style={{ fontSize: 13, color: C.t, fontWeight: 500 }}>January 2023</div>
        </div>

        <button style={{ ...btn("danger"), width: "100%", justifyContent: "center", marginTop: 10, borderRadius: 10 }}>
          <LogOut size={14} />Sign Out
        </button>
      </div>

      {/* Right column */}
      <div>
        {/* Profile info */}
        <div style={{ ...card(), padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Profile Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="First Name"><input style={inp()} defaultValue="KR" /></FormField>
            <FormField label="Last Name"> <input style={inp()} defaultValue="Fuels" /></FormField>
            <FormField label="Email Address"><input style={inp()} defaultValue="admin@krfuels.com" /></FormField>
            <FormField label="Phone">      <input style={inp()} defaultValue="+91 98421 00000" /></FormField>
          </div>
          <FormField label="Role">
            <input style={{ ...inp(), opacity: 0.6 }} defaultValue="Super Administrator" disabled />
          </FormField>
          <button style={{ ...btn(), marginTop: 8 }}><Save size={14} />Update Profile</button>
        </div>

        {/* Password */}
        <div style={{ ...card(), padding: 20 }}>
          <div style={{ fontWeight: 600, color: C.t, fontSize: 14, marginBottom: 16 }}>Change Password</div>
          <FormField label="Current Password">     <input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <FormField label="New Password">         <input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <FormField label="Confirm New Password"> <input style={inp()} type="password" placeholder="••••••••" /></FormField>
          <button style={btn()}><Check size={14} />Update Password</button>
        </div>
      </div>
    </div>
  </div>
);

export default ProfilePage;
