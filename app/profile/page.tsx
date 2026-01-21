"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  items: OrderItem[];
  recipient: {
    firstName: string;
    lastName: string;
    patronymic?: string;
  };
  phone: string;
  payment_category: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push("/auth");
          return;
        }

        // Завантажити профіль користувача
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          full_name: profileData?.full_name || "",
          phone: profileData?.phone || "",
          created_at: profileData?.created_at
        });

        // Завантажити історію замовлень
        const { data: ordersData } = await supabase
          .from("order_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (ordersData) {
          setOrders(ordersData as Order[]);
        }
      } catch (err) {
        console.error("Помилка завантаження профілю:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Помилка виходу:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("uk-UA") + " грн";
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Користувач не знайдений</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Кнопка повернення */}
      <button
        onClick={() => router.push("/")}
        style={{
          marginBottom: "2rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#ff6b35",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Повернутися на головну
      </button>

      {/* Інформація про користувача */}
      <div style={{
        backgroundColor: "#f9f9f9",
        padding: "2rem",
        borderRadius: "8px",
        marginBottom: "2rem"
      }}>
        <h1 style={{ margin: "0 0 1.5rem 0" }}>👤 Мій Профіль</h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          <div>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <strong>Email:</strong>
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              {user.email}
            </p>
          </div>

          <div>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <strong>Ім&apos;я:</strong>
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              {user.full_name || "Не заповнено"}
            </p>
          </div>

          <div>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <strong>Телефон:</strong>
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              {user.phone || "Не заповнено"}
            </p>
          </div>

          <div>
            <p style={{ margin: "0.5rem 0", color: "#666" }}>
              <strong>Учасник з:</strong>
            </p>
            <p style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              {user.created_at ? formatDate(user.created_at) : "Невідомо"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Вийти з облікового запису
        </button>
      </div>

      {/* Історія замовлень */}
      <div>
        <h2 style={{ marginBottom: "1.5rem" }}>📋 Історія замовлень</h2>

        {orders.length === 0 ? (
          <div style={{
            backgroundColor: "#f5f5f5",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            <p style={{ color: "#666", marginBottom: "1rem" }}>У вас ще немає замовлень</p>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#ff6b35",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Перейти до магазину
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: "#f9f9f9",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}
              >
                {/* Заголовок замовлення */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  style={{
                    width: "100%",
                    padding: "1.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "1rem"
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                      Замовлення #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 0.5rem 0", fontWeight: "bold", color: "#ff6b35" }}>
                        {formatPrice(order.total_price)}
                      </p>
                      <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>
                        {order.items?.length || 0} товарів
                      </p>
                    </div>

                    <span style={{ fontSize: "1.5rem" }}>
                      {expandedOrder === order.id ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                {/* Деталі замовлення */}
                {expandedOrder === order.id && (
                  <div style={{
                    padding: "1.5rem",
                    borderTop: "1px solid #ddd",
                    backgroundColor: "#fff"
                  }}>
                    {/* Інформація про отримувача */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ margin: "0 0 0.75rem 0" }}>Отримувач</h4>
                      <p style={{ margin: "0.25rem 0", color: "#666" }}>
                        {order.recipient?.lastName} {order.recipient?.firstName}
                        {order.recipient?.patronymic && ` ${order.recipient.patronymic}`}
                      </p>
                      <p style={{ margin: "0.25rem 0", color: "#666" }}>
                        {order.phone}
                      </p>
                    </div>

                    {/* Товари в замовленні */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ margin: "0 0 0.75rem 0" }}>Товари</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              padding: "0.75rem",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "4px",
                              display: "flex",
                              justifyContent: "space-between"
                            }}
                          >
                            <div>
                              <p style={{ margin: "0 0 0.25rem 0", fontWeight: "500" }}>
                                {item.title}
                              </p>
                              <p style={{ margin: "0", color: "#666", fontSize: "0.9rem" }}>
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p style={{ margin: "0", fontWeight: "bold", color: "#ff6b35" }}>
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Способ оплати */}
                    <div style={{
                      padding: "0.75rem",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px"
                    }}>
                      <p style={{ margin: "0", color: "#666" }}>
                        <strong>Способ оплаты:</strong>{" "}
                        {order.payment_category === "on_delivery"
                          ? "При отриманні"
                          : order.payment_category === "pay_now"
                          ? "Картою"
                          : "Кредит"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}