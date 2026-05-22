import type { FC, ReactNode } from "react";
import { lbl } from "../../styles/shared";

interface FormFieldProps {
  label: string;
  children: ReactNode;
}

const FormField: FC<FormFieldProps> = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={lbl}>{label}</label>
    {children}
  </div>
);

export default FormField;
