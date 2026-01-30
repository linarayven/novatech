// Переиспользуемые стили компонентов

export const authInputStyle = {
  padding: "0.75rem",
  backgroundColor: "#3a3a3a",
  border: "1px solid #444",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "1rem"
};

export const authButtonStyle = {
  padding: "0.75rem",
  backgroundColor: "#ff6b35",
  border: "none",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer"
};

export const errorMessageStyle = {
  color: "#dc2626",
  fontSize: "0.85rem",
  margin: "0.25rem 0 0 0"
};

export const formGroupStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "1rem"
};

export const radioLabelStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  padding: "0.75rem",
  border: "1px solid #ddd",
  borderRadius: "4px",
  marginBottom: "0.75rem",
  cursor: "pointer"
};

export const cartInputStyle = {
  borderRadius: "4px",
  fontSize: "1rem",
  boxSizing: "border-box" as const
};

export const getInputStyleWithError = (hasError: boolean) => ({
  ...cartInputStyle,
  borderColor: hasError ? "#dc2626" : "initial"
});
