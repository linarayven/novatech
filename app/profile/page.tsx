"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  brand?: string;
  image?: string;
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
    patronymic?: string;
  };
  items: OrderItem[];
  total_price: number;
  payment_category: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const [editFirstName, setEditFirstName] = useState("");
  const [editPatronymic, setEditPatronymic] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      setError(null);

      try {
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
          
          // Парсимо full_name на компоненти
          const fullNameParts = profileData.full_name ? profileData.full_name.trim().split(/\s+/) : [];
          let firstName = "";
          let patronymic = "";
          let lastName = "";
          
          if (fullNameParts.length === 2) {
            [firstName, lastName] = fullNameParts;
          } else if (fullNameParts.length >= 3) {
            firstName = fullNameParts[0];
            patronymic = fullNameParts[1];
            lastName = fullNameParts.slice(2).join(" ");
          } else if (fullNameParts.length === 1) {
            firstName = fullNameParts[0];
          }
          
          setEditFirstName(firstName);
          setEditPatronymic(patronymic);
          setEditLastName(lastName);
          setEditPhone(profileData.phone || "");
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError("Помилка при виході");
    } else {
      router.push("/");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!editFirstName.trim()) {
      setError("Введіть ім'я");
      setSaving(false);
      return;
    }

    if (!editLastName.trim()) {
      setError("Введіть прізвище");
      setSaving(false);
      return;
    }

    if (!editPhone.trim()) {
      setError("Введіть номер телефону");
      setSaving(false);
      return;
    }

    try {
      // Формуємо full_name з компонентів
      const fullName = `${editFirstName}${editPatronymic ? ' ' + editPatronymic : ''} ${editLastName}`.trim();
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: editPhone
        })
        .eq("id", user?.id);

      if (updateError) {
        setError("Помилка при збереженні");
      } else {
        setProfile({
          ...profile!,
          full_name: fullName,
          phone: editPhone
        });
        setSuccess("Профіль успішно оновлено!");
        setIsEditing(false);
      }
    } catch (err) {
      setError("Помилка при збереженні. Спробуйте пізніше.");
    } finally {
      setSaving(false);
    }
  };

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
            padding: "0.75rem 1.5rem",
            backgroundColor: "#ff6b35",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold"
          }}
        >
          ← Повернутися на головну
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
                fontSize: "1rem",
                fontWeight: "bold"
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
            👤 Мій профіль
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
            📋 Історія замовлень ({orders.length})
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
            ❤️ Список бажань ({wishlistProducts.length})
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
            {!isEditing ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 style={{ marginTop: 0 }}>Інформація профілю</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#ff6b35",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}
                  >
                    ✏️ Редактировать
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                  <div>
                    <p style={{ color: "#888", margin: "0 0 0.5rem 0" }}>Ім&apos;я</p>
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
              </>
            ) : (
              <form onSubmit={handleSaveProfile}>
                <h2 style={{ marginTop: 0 }}>Редактування профілю</h2>

                {error && (
                  <div style={{
                    padding: "1rem",
                    backgroundColor: "#fecaca",
                    color: "#dc2626",
                    borderRadius: "4px",
                    marginBottom: "1.5rem",
                    fontSize: "0.9rem"
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{
                    padding: "1rem",
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                    borderRadius: "4px",
                    marginBottom: "1.5rem",
                    fontSize: "0.9rem"
                  }}>
                    {success}
                  </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Ім&apos;я *
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Ім&apos;я"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Отчество (по батькові)
                  </label>
                  <input
                    type="text"
                    value={editPatronymic}
                    onChange={(e) => setEditPatronymic(e.target.value)}
                    placeholder="Отчество"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Прізвище *
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Прізвище"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#ff6b35",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      opacity: saving ? 0.6 : 1
                    }}
                  >
                    {saving ? "Збереження..." : "Зберегти"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#e5e5e5",
                      color: "#333",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1rem"
                    }}
                  >
                    Скасувати
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Вкладка Історія замовлень */}
        {activeTab === "orders" && (
          <div>
            <h2 style={{ marginBottom: "1.5rem" }}>📋 Історія замовлень</h2>

            {orders.length === 0 ? (
              <div style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <p style={{ color: "#666", marginBottom: "1rem" }}>У вас поки немає замовлень</p>
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
                      backgroundColor: "white",
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
                        fontSize: "1rem",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.backgroundColor = "#f9f9f9";
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLButtonElement;
                        target.style.backgroundColor = "transparent";
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
                        backgroundColor: "#fafafa"
                      }}>
                        {/* Інформація про отримувача */}
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h4 style={{ margin: "0 0 0.75rem 0" }}>Отримувач</h4>
                          <p style={{ margin: "0.25rem 0", color: "#666" }}>
                            {order.recipient?.lastName} {order.recipient?.firstName}
                            {order.recipient?.patronymic && ` ${order.recipient.patronymic}`}
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
                                  backgroundColor: "white",
                                  borderRadius: "4px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  border: "1px solid #eee"
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
                          backgroundColor: "white",
                          borderRadius: "4px",
                          border: "1px solid #eee"
                        }}>
                          <p style={{ margin: "0", color: "#666" }}>
                            <strong>Спосіб оплати:</strong>{" "}
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
                    fontSize: "1rem",
                    fontWeight: "bold"
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
                      flexDirection: "column",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    {product.image && !loadedImages.has(product.id) ? (
                      <Image
                        src={product.image}
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
                        fontWeight: "bold",
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