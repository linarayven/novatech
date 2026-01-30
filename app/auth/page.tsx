"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import { formatPhoneInput, validatePhone } from "@/src/lib/validation";
import { formatFullName } from "@/src/lib/nameHelper";
import { FormInput, FormError, FormSuccess } from "@/app/components/FormComponents";
import { authInputStyle, authButtonStyle } from "@/src/lib/styles";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Вход
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Регистрация
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerPatronymic, setRegisterPatronymic] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("+38 ");

  // Демо вход
  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@example.com",
        password: "admin123"
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
      setError("Помилка входу. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // Вход
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!loginEmail || !loginPassword) {
      setError("Заповніть усі поля");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
      setError("Помилка входу. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // Регистрация
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!registerEmail || !registerPassword || !registerFirstName || !registerLastName || !registerPhone.trim()) {
      setError("Заповніть усі обов'язкові поля");
      setLoading(false);
      return;
    }

    if (!validatePhone(registerPhone)) {
      setError("Введіть дійсний номер мобільного телефону (мінімум 10 цифр)");
      setLoading(false);
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setError("Паролі не збігаються");
      setLoading(false);
      return;
    }

    if (registerPassword.length < 6) {
      setError("Пароль має бути не менше 6 символів");
      setLoading(false);
      return;
    }

    try {
      // Реєстрація
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            first_name: registerFirstName,
            patronymic: registerPatronymic,
            last_name: registerLastName
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Формуємо full_name з компонентів
        const fullName = formatFullName(registerFirstName, registerPatronymic, registerLastName);
        
        console.log("Користувач створений:", data.user.id);
        console.log("Full name для збереження:", fullName);
        
        // Додавання профілю
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert([{
            id: data.user.id,
            email: registerEmail,
            first_name: registerFirstName,
            patronymic: registerPatronymic || null,
            last_name: registerLastName,
            full_name: fullName,
            phone: registerPhone,
            created_at: new Date().toISOString()
          }])
          .select();

        if (profileError) {
          console.error("Помилка при збереженні профілю:", profileError);
          console.error("Код помилки:", profileError.code);
          console.error("Повідомлення:", profileError.message);
          setError(`Помилка при збереженні профілю: ${profileError.message || 'Невідома помилка'}`);
          setLoading(false);
          return;
        }

        console.log("Профіль успішно створений:", profileData);

        setSuccess("Реєстрація успішна! Ви можете увійти.");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterPasswordConfirm("");
        setRegisterFirstName("");
        setRegisterPatronymic("");
        setRegisterLastName("");
        setRegisterPhone("+38 ");
        
        setTimeout(() => {
          setActiveTab("login");
        }, 1500);
      }
    } catch (err) {
      console.error("Помилка реєстрації:", err);
      setError("Помилка реєстрації. Спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#1a1a1a",
      padding: "1rem"
    }}>
      {/* Кнопка "Назад" */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: "1.5rem",
          left: "1.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#ff6b35",
          border: "none",
          borderRadius: "4px",
          color: "#fff",
          fontSize: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontWeight: "500",
          transition: "background-color 0.2s ease"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#e55a24";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#ff6b35";
        }}
      >
        ← Назад
      </button>

      <div style={{
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "#2a2a2a",
        borderRadius: "8px",
        padding: "2rem",
        color: "#fff"
      }}>
        {/* Логотип */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ 
            fontSize: "2rem", 
            margin: "0 0 0.5rem 0",
            color: "#fff"
          }}>
            NovaTech
          </h1>
          <p style={{ margin: 0, color: "#888" }}>Розумні покупки</p>
        </div>

        {/* Вкладки */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #444"
        }}>
          <button
            onClick={() => setActiveTab("login")}
            style={{
              padding: "0.75rem 1rem",
              background: "none",
              border: "none",
              color: activeTab === "login" ? "#ff6b35" : "#888",
              fontSize: "1rem",
              cursor: "pointer",
              borderBottom: activeTab === "login" ? "2px solid #ff6b35" : "none",
              marginBottom: "-1px"
            }}
          >
            Увійти
          </button>
          <button
            onClick={() => setActiveTab("register")}
            style={{
              padding: "0.75rem 1rem",
              background: "none",
              border: "none",
              color: activeTab === "register" ? "#ff6b35" : "#888",
              fontSize: "1rem",
              cursor: "pointer",
              borderBottom: activeTab === "register" ? "2px solid #ff6b35" : "none",
              marginBottom: "-1px"
            }}
          >
            Реєстрація
          </button>
        </div>

        {/* Повідомлення об помилках та успіху */}
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}

        {/* Вкладка Вход */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FormInput
              type="email"
              placeholder="Email або номер мобільного"
              value={loginEmail}
              onChange={setLoginEmail}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="password"
              placeholder="Пароль"
              value={loginPassword}
              onChange={setLoginPassword}
              style={{...authInputStyle, color: "#fff"}}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                ...authButtonStyle,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Завантаження..." : "Увійти"}
            </button>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "1rem 0"
            }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#444" }}></div>
              <span style={{ color: "#888" }}>або</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#444" }}></div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#444",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              Вход як демо (admin/admin)
            </button>
          </form>
        )}

        {/* Вкладка Регистрация */}
        {activeTab === "register" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FormInput
              type="text"
              placeholder="Ім'я *"
              value={registerFirstName}
              onChange={setRegisterFirstName}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="text"
              placeholder="Отчество (по батькові)"
              value={registerPatronymic}
              onChange={setRegisterPatronymic}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="text"
              placeholder="Прізвище *"
              value={registerLastName}
              onChange={setRegisterLastName}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="tel"
              inputMode="numeric"
              placeholder="Телефон +38 0__ ___ __ __ *"
              value={registerPhone}
              onChange={(v) => setRegisterPhone(formatPhoneInput(v))}
              maxLength={17}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="email"
              placeholder="Email *"
              value={registerEmail}
              onChange={setRegisterEmail}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="password"
              placeholder="Пароль *"
              value={registerPassword}
              onChange={setRegisterPassword}
              style={{...authInputStyle, color: "#fff"}}
            />
            <FormInput
              type="password"
              placeholder="Підтвердіть пароль *"
              value={registerPasswordConfirm}
              onChange={setRegisterPasswordConfirm}
              style={{...authInputStyle, color: "#fff"}}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                ...authButtonStyle,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Завантаження..." : "Зареєструватися"}
            </button>
          </form>
        )}

        {/* Підвал */}
        <p style={{
          fontSize: "0.85rem",
          color: "#666",
          margin: "1.5rem 0 0 0",
          textAlign: "center"
        }}>
          © NovaTech 2025 — 2026
        </p>
      </div>
    </div>
  );
}