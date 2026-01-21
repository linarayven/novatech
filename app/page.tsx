"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

// ✅ Типи
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  brand?: string;
  description?: string;
  image?: string;
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Стан
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<(Product & { quantity: number })[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [paymentCategory, setPaymentCategory] = useState<string>("on_delivery");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // ==================== Загрузка продуктів ====================
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Помилка завантаження:", error);
        setError("Не вдалося завантажити товари");
        setProducts([]);
        setFilteredProducts([]);
      } else {
        setProducts(data || []);
        setFilteredProducts(data || []);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // ==================== Підкатегорії через useMemo ====================
  const subCategories = useMemo(() => {
    if (!category) return [];
    return Array.from(new Set(products.filter(p => p.category === category).map(p => p.brand)))
      .filter((brand): brand is string => brand !== undefined && brand !== '') as string[];
  }, [category, products]);

  // ==================== Подсказки для пошуку ====================
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    if (!debouncedSearchText) {
      setSuggestions([]);
      return;
    }

    const filtered = products
      .filter((p) => p.title.toLowerCase().includes(debouncedSearchText.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [debouncedSearchText, products]);

  // ==================== Функції ====================
  const handleSearch = useCallback(() => {
    const result = products.filter((p) =>
      p.title.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(result);
    setCategory(null);
    setSubCategory(null);
    setSuggestions([]);
  }, [products, searchText]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
    if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  const handleCategoryFilter = useCallback((cat: string) => {
    setCategory(cat);
    setSubCategory(null);
    setFilteredProducts(products.filter(p => p.category === cat));
  }, [products]);

  const handleSubCategoryFilter = useCallback((sub: string, cat: string) => {
    setSubCategory(sub);
    setFilteredProducts(products.filter(p => p.category === cat && p.brand === sub));
  }, [products]);

  // Скидання фільтрів
  const resetFilters = useCallback(() => {
    setCategory(null);
    setSubCategory(null);
    setSearchText("");
    setSuggestions([]);
    setFilteredProducts(products);
  }, [products]);

  // Можна добавити форматування
  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('uk-UA') + ' грн';
  };

  // Обробка помилки завантаження image
  const handleImageError = (productId: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  };

  // ==================== Логика Корзини ====================
  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, [removeFromCart]);

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ==================== JSX ====================
  return (
    <>
      <div className="page-container">
      {/* ====== Хедер ====== */}
      <header className="header">
        {/* NovaTech */}
        <h1
          className="header-title"
          onClick={() => {
            resetFilters();
            router.push("/");
          }}
        >
          NovaTech
        </h1>

        {/* Пошук */}
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Пошук товарів..."
              aria-label="Пошук товарів"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyPress}
              ref={inputRef}
              className="search-input"
            />

            <button
              className="search-btn"
              onClick={handleSearch}
              aria-label="Пошук"
            >
              🔍
            </button>

            {/* Автопропозиції */}
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="suggestion-item"
                    onClick={() => {
                      setSearchText(s.title);
                      setFilteredProducts([s]);
                      setSuggestions([]);
                      inputRef.current?.focus();
                    }}
                  >
                    {s.title} — {s.price} грн
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Профіль і корзина */}
        <div className="header-actions">
          <button
            aria-label="Профіль"
            className="icon-btn"
          >
            👤
          </button>
          <button
            aria-label="Корзина"
            className="icon-btn"
            onClick={() => setShowCart(!showCart)}
            style={{ position: 'relative' }}
          >
            🛒
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ==================== Основний контент ==================== */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem' }}>
        {/* ====== Бокова панель ====== */}
        <aside style={{ width: '16rem', flexShrink: 0 }}>
          {/* Breadcrumbs */}
          <div className="breadcrumb">
            <button className="breadcrumb-btn" onClick={() => { resetFilters(); router.push("/"); }}>🏠</button>
            {category && (
              <>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <button className="breadcrumb-btn" onClick={() => handleCategoryFilter(category)}>
                  {CATEGORIES.find(c => c.name === category)?.label}
                </button>
              </>
            )}
            {subCategory && (
              <>
                <span style={{ margin: '0 0.5rem' }}>/</span>
                <span>{subCategory}</span>
              </>
            )}
          </div>

          {/* Категорії */}
          {CATEGORIES.map((cat) => (
            <div key={cat.name} style={{ marginBottom: '1rem' }}>
              <button
                className={`category-btn ${category === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(cat.name)}
              >
                {cat.label}
              </button>

              {category === cat.name && subCategories.length > 0 && (
                <div style={{ marginLeft: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      className={`subcategory-btn ${subCategory === sub ? 'active' : ''}`}
                      onClick={() => handleSubCategoryFilter(sub, cat.name)}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* ====== Сетка товарів ====== */}
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>Завантаження...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && filteredProducts.length === 0 && <p className="empty-state">Товари не знайдені</p>}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
            >
              {product.image && !loadedImages.has(product.id) ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={200}
                  onError={() => handleImageError(product.id)}
                  className="product-image"
                />
              ) : (
                <div className="product-image-placeholder">
                  📦 Немає зображення
                </div>
              )}
              <h2 className="product-title">{product.title}</h2>
              <p className="product-price">Ціна: {formatPrice(product.price)}</p>
              <p className="product-category">Категорія: {product.category}</p>
              {product.brand && <p className="product-brand">Бренд: {product.brand}</p>}
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                Додати в корзину
              </button>
            </div>
          ))}
        </main>
      </div>
      </div>

      {/* ==================== МОДАЛ КОРЗИНИ ==================== */}
      {showCart && (
        <div className="cart-modal-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Ваша корзина</h2>
              <button 
                onClick={() => setShowCart(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="empty-state">Корзина пуста</p>
            ) : (
              <div className="cart-content">
                {/* Список товарів */}
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div>
                        <p className="cart-item-title">{item.title}</p>
                        <p className="cart-item-price">
                          {formatPrice(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <div className="cart-item-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="cart-qty-btn"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="cart-qty-btn"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="cart-remove-btn"
                        >
                          Видалити
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Форма платежу */}
                <div className="cart-form">
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label><strong>Оплата</strong></label>
                    
                    {/* Категорія 1: Оплата під час отримання */}
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="delivery"
                        name="payment_category"
                        value="on_delivery"
                        checked={paymentCategory === "on_delivery"}
                        onChange={(e) => setPaymentCategory(e.target.value)}
                      />
                      <label htmlFor="delivery">Оплата під час отримання товару</label>
                    </div>

                    {/* Категорія 2: Оплатити зараз */}
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="pay_now"
                        name="payment_category"
                        value="pay_now"
                        checked={paymentCategory === "pay_now"}
                        onChange={(e) => setPaymentCategory(e.target.value)}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1.5rem' }}>
                        <label htmlFor="pay_now"><strong>Оплата карткою</strong></label>

                        {paymentCategory === "pay_now" && (
                          <div className="payment-methods" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                            <label>
                              <input
                                type="radio"
                                name="payment_method"
                                value="card"
                                checked={paymentMethod === "card"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              Картою
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="payment_method"
                                value="google_pay"
                                checked={paymentMethod === "google_pay"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              Google Pay
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="payment_method"
                                value="apple_pay"
                                checked={paymentMethod === "apple_pay"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                              />
                              Apple Pay
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Категорія 3: Кредит та оплата частинами */}
                    <div className="payment-option">
                      <input
                        type="radio"
                        id="credit"
                        name="payment_category"
                        value="credit"
                        checked={paymentCategory === "credit"}
                        onChange={(e) => setPaymentCategory(e.target.value)}
                      />
                      <label htmlFor="credit">Кредит та оплата частинами</label>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.5rem 0 0 1.5rem' }}>
                        Оформлення кредитів у банках партнерів
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Всього */}
            {cartItems.length > 0 && (
              <div className="cart-total">
                <p><strong>Всього: {formatPrice(totalPrice)}</strong></p>
                <button className="checkout-btn">Оформити замовлення</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}