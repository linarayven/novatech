import React from "react";
import { errorMessageStyle } from "@/src/lib/styles";

interface FormInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
  style?: React.CSSProperties;
  inputMode?: "numeric" | "text" | "email" | "tel" | "url" | "decimal" | "search";
}

export const FormInput: React.FC<FormInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
  style,
  inputMode
}) => (
  <div style={{ width: "100%" }}>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      inputMode={inputMode}
      style={{
        width: "100%",
        padding: "0.75rem",
        borderRadius: "4px",
        border: error ? "2px solid #dc2626" : "1px solid #ddd",
        fontSize: "1rem",
        boxSizing: "border-box",
        ...style
      }}
    />
    {error && <p style={errorMessageStyle}>{error}</p>}
  </div>
);

interface FormErrorProps {
  message: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message }) => (
  <div style={{
    padding: "0.75rem",
    backgroundColor: "#fecaca",
    color: "#dc2626",
    borderRadius: "4px",
    marginBottom: "1.5rem",
    fontSize: "0.9rem"
  }}>
    {message}
  </div>
);

interface FormSuccessProps {
  message: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ message }) => (
  <div style={{
    padding: "0.75rem",
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    borderRadius: "4px",
    marginBottom: "1.5rem",
    fontSize: "0.9rem"
  }}>
    {message}
  </div>
);
