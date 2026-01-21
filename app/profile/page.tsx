"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  brand?: string;
  image_url?: string;
}

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface UserProfile {
  id: string;
  full_name?: string;
  email: string;
  phone?: string;
}

interface AuthUser {
  id: string;
  email?: string;
}

interface Order {
  id: string;
  created_at: string;
  recipient: {
    firstName: string;
    lastName: string;
  };
  items: OrderItem[];
  total_price: number;
  payment_category: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Перевірка авторизації та завантаження даних
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      setError(null);

      try {
        // Перевірка сессії
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/auth");
          return;
        }

        setUser(session.user as AuthUser);

        // Завантаження профілю
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Помилка завантаження профілю:", profileError);
        } else if (profileData) {
          setProfile(profileData);
        }

        // Завантаження замовлень
        const { data: ordersData, error: ordersError } = await supabase
          .from("order_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Помилка завантаження замовлень:", ordersError);
        } else {
          setOrders(ordersData || []);
        }

        // Завантаження списку бажань
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", session.user.id);

        if (wishlistError) {
          console.error("Помилка завантаження списку бажань:", wishlistError);
        } else if (wishlistData && wishlistData.length > 0) {
          // Завантаження деталей товарів
          const productIds = wishlistData.map(w => w.product_id);
          const { data: productsData } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds);

          setWishlistProducts(productsData || []);
        }
      } catch (err) {
        console.error("Помилка:", err);
        setError("Помилка завантаження даних");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  // Вихід
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Помилка при виході");
    } else {
      router.push("/auth");
    }
  };

  // Видалення з избранного
  const handleRemoveFromWishlist = async (productId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);

    if (error) {
      setError("Помилка видалення з избранного");
    } else {
      setWishlistProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Очистити список бажань
  const handleClearWishlist = async () => {
    if (!user) return;

    if (!confirm("Ви впевнені, що хочете очистити список бажань?")) {
      return;
    }

    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      setError("Помилка очистки списку бажань");
    } else {
      setWishlistProducts([]);
    }
  };

  const handleImageError = (productId: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('uk-UA') + ' грн';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Навігація */}
        <button
          onClick={() => router.push("/")}
          style={{
            marginBottom: "2rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#ff6b35",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        >
          ← Повернутись на головну
        </button>

        {/* Заголовок профілю */}
        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h1 style={{ margin: "0 0 0.5rem 0" }}>
                {profile?.full_name || user?.email || "Користувач"}
              </h1>
              <p style={{ margin: "0.25rem 0", color: "#666" }}>
                Email: {user?.email}
              </p>
              {profile?.phone && (
                <p style={{ margin: "0.25rem 0", color: "#666" }}>
                  Телефон: {profile.phone}
                </p>
              )}
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
                fontSize: "1rem"
              }}
            >
              Вихід
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #ddd"
        }}>
          <button
            onClick={() => setActiveTab("profile")}
            style={{
              padding: "1rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "profile" ? "3px solid #ff6b35" : "none",
              color: activeTab === "profile" ? "#ff6b35" : "#666",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: activeTab === "profile" ? "bold" : "normal",
              marginBottom: "-2px"
            }}
          >
            Мій профіль
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "1rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "orders" ? "3px solid #ff6b35" : "none",
              color: activeTab === "orders" ? "#ff6b35" : "#666",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: activeTab === "orders" ? "bold" : "normal",
              marginBottom: "-2px"
            }}
          >
            Історія замовлень ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            style={{
              padding: "1rem 1.5rem",
              background: "none",
              border: "none",
              borderBottom: activeTab === "wishlist" ? "3px solid #ff6b35" : "none",
              color: activeTab === "wishlist" ? "#ff6b35" : "#666",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: activeTab === "wishlist" ? "bold" : "normal",
              marginBottom: "-2px"
            }}
          >
            Список бажань ({wishlistProducts.length})
          </button>
        </div>

        {/* Помилка */}
        {error && (
          <div style={{
            padding: "1rem",
            backgroundColor: "#fecaca",
            color: "#dc2626",
            borderRadius: "4px",
            marginBottom: "2rem"
          }}>
            {error}
          </div>
        )}

        {/* Вкладка Профіль */}
        {activeTab === "profile" && (
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px" }}>
            <h2 style={{ marginTop: 0 }}>Інформація профілю</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
              <div>
                <p style={{ color: "#888", margin: "0 0 0.5rem 0" }}>Ім'я</p>
                <p style={{ margin: 0, fontSize: "1.1rem" }}>{profile?.full_name || "Не вказано"}</p>
              </div>
              <div>
                <p style={{ color: "#888", margin: "0 0 0.5rem 0" }}>Email</p>
                <p style={{ margin: 0, fontSize: "1.1rem" }}>{user?.email}</p>
              </div>
              <div>
                <p style={{ color: "#888", margin: "0 0 0.5rem 0" }}>Телефон</p>
                <p style={{ margin: 0, fontSize: "1.1rem" }}>{profile?.phone || "Не вказано"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Вкладка Історія замовлень */}
        {activeTab === "orders" && (
          <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px" }}>
            <h2 style={{ marginTop: 0 }}>Історія замовлень</h2>
            {orders.length === 0 ? (
              <p style={{ color: "#888" }}>У вас поки немає замовлень</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                          {formatDate(order.created_at)}
                        </p>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "1.1rem", fontWeight: "bold" }}>
                          Замовлення від {order.recipient.firstName} {order.recipient.lastName}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "#ff6b35" }}>
                        {formatPrice(order.total_price)}
                      </p>
                    </div>
                    <div style={{ borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                      <p style={{ margin: "0 0 0.5rem 0", color: "#888" }}>Товари:</p>
                      {order.items.map((item, idx) => (
                        <p key={idx} style={{ margin: "0.25rem 0", fontSize: "0.95rem" }}>
                          {item.title} x {item.quantity} = {formatPrice(item.price * item.quantity)}
                        </p>
                      ))}
                    </div>
                    <p style={{ margin: "0.5rem 0 0 0", color: "#888", fontSize: "0.9rem" }}>
                      Спосіб оплати: {order.payment_category === "on_delivery" ? "При отриманні" : "Карткою"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Вкладка Список бажань */}
        {activeTab === "wishlist" && (
          <div>
            {wishlistProducts.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <button
                  onClick={handleClearWishlist}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  Очистити список бажань
                </button>
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1.5rem"
            }}>
              {wishlistProducts.length === 0 ? (
                <div style={{ gridColumn: "1 / -1", backgroundColor: "white", padding: "2rem", borderRadius: "8px" }}>
                  <p style={{ color: "#888", textAlign: "center" }}>Список бажань пустий</p>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    {product.image_url && !loadedImages.has(product.id) ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={250}
                        height={200}
                        onError={() => handleImageError(product.id)}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginBottom: "1rem"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "200px",
                        backgroundColor: "#eee",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "1rem"
                      }}>
                        📦 Немає зображення
                      </div>
                    )}
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      {product.title}
                    </h3>
                    <p style={{ margin: "0 0 1rem 0", color: "#ff6b35", fontSize: "1.2rem", fontWeight: "bold" }}>
                      {formatPrice(product.price)}
                    </p>
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        marginTop: "auto"
                      }}
                    >
                      Видалити з списку
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}