"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
  const [registerName, setRegisterName] = useState("");

  // Демо вход
  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "admin@novatech.com",
        password: "admin"
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/profile");
      }
    } catch (err) {
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

    if (!registerEmail || !registerPassword || !registerName) {
      setError("Заповніть усі поля");
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
        password: registerPassword
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Додавання профілю
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: registerEmail,
          full_name: registerName
        });

        if (profileError) {
          console.error("Помилка при створенні профілю:", profileError);
        }

        setSuccess("Реєстрація успішна! Ви можете увійти.");
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterPasswordConfirm("");
        setRegisterName("");
        
        setTimeout(() => {
          setActiveTab("login");
        }, 1500);
      }
    } catch (err) {
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
        {error && (
          <div style={{
            padding: "0.75rem",
            backgroundColor: "#dc2626",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: "0.75rem",
            backgroundColor: "#16a34a",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}>
            {success}
          </div>
        )}

        {/* Вкладка Вход */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="email"
              placeholder="Email або номер мобільного"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#ff6b35",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem",
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
            <input
              type="text"
              placeholder="Ім'я"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <input
              type="password"
              placeholder="Пароль"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <input
              type="password"
              placeholder="Підтвердіть пароль"
              value={registerPasswordConfirm}
              onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
              style={{
                padding: "0.75rem",
                backgroundColor: "#3a3a3a",
                border: "1px solid #444",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "0.75rem",
                backgroundColor: "#ff6b35",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "1rem",
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
          © NovaTech 1992 — 2026
        </p>
      </div>
    </div>
  );
}