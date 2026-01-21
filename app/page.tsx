"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";

// Типи
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  brand?: string;
  sub_category?: string;
  description?: string;
  image_url?: string;
  specs?: Record<string, any>;
  created_at?: string;
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Стан компонента
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
  
  const [recipient, setRecipient] = useState({
    lastName: "",
    firstName: "",
    patronymic: "",
    phone: "+38 "
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    lastName: "",
    firstName: ""
  });

  // Загрузка товарів зі Supabase
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

  // Отримання доступних брендів для обраної категорії
  const subCategories = useMemo(() => {
    if (!category) return [];
    return Array.from(new Set(products.filter(p => p.category === category).map(p => p.brand)))
      .filter((brand): brand is string => brand !== undefined && brand !== '') as string[];
  }, [category, products]);

  // Дебаунс пошукового тексту
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Автопропозиції для пошуку
  useEffect(() => {
    if (!debouncedSearchText) {
      setTimeout(() => setSuggestions([]), 0);
      return;
    }

    const filtered = products
      .filter((p) => p.title.toLowerCase().includes(debouncedSearchText.toLowerCase()))
      .slice(0, 5);
    setTimeout(() => setSuggestions(filtered), 0);
  }, [debouncedSearchText, products]);

  // Функції фільтрування товарів
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

  const resetFilters = useCallback(() => {
    setCategory(null);
    setSubCategory(null);
    setSearchText("");
    setSuggestions([]);
    setFilteredProducts(products);
  }, [products]);

  // Форматування ціни
  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toLocaleString('uk-UA') + ' грн';
  };

  const handleImageError = (productId: string) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  };

  // Функції управління корзиною
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

  // Валідація e-mail
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валідація телефону
  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  // Обробка вводу e-mail з фільтруванням символів
  const handleEmailChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9@._\-+]/g, '');
    
    setEmail(filtered);
    if (filtered && !validateEmail(filtered)) {
      setErrors(prev => ({ ...prev, email: "Введіть дійсну поштову адресу" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  // Обробка вводу телефону з форматуванням +38 0XX XXX XX XX
  const handlePhoneChange = (value: string) => {
    if (!value || value === '') {
      setRecipient(prev => ({ ...prev, phone: '+38 ' }));
      return;
    }
    
    if (!value.startsWith('+38')) {
      return;
    }
    
    let digitsOnly = value.replace(/\D/g, '');
    const limited = digitsOnly.slice(0, 12);
    
    let formatted = '+38';
    if (limited.length > 2) {
      formatted += ' ' + limited.slice(2, 5);
    }
    if (limited.length > 5) {
      formatted += ' ' + limited.slice(5, 8);
    }
    if (limited.length > 8) {
      formatted += ' ' + limited.slice(8, 10);
    }
    if (limited.length > 10) {
      formatted += ' ' + limited.slice(10, 12);
    }
    
    setRecipient(prev => ({ ...prev, phone: formatted }));
    
    if (limited.length === 12 && !validatePhone(formatted)) {
      setErrors(prev => ({ ...prev, phone: "Введіть дійсний номер мобільного телефону отримувача" }));
    } else if (limited.length === 12) {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  // Обробка вводу прізвища з фільтруванням та обмеженням довжини
  const handleLastNameChange = (value: string) => {
    const filtered = value.replace(/[^а-яА-ЯіІєЄґҐ'ʼ\s-]/g, '');
    const limited = filtered.slice(0, 50);
    
    setRecipient(prev => ({ ...prev, lastName: limited }));
    if (limited.trim()) {
      setErrors(prev => ({ ...prev, lastName: "" }));
    }
  };

  // Обробка вводу імені з фільтруванням та обмеженням довжини
  const handleFirstNameChange = (value: string) => {
    const filtered = value.replace(/[^а-яА-ЯіІєЄґҐ'ʼ\s-]/g, '');
    const limited = filtered.slice(0, 50);
    
    setRecipient(prev => ({ ...prev, firstName: limited }));
    if (limited.trim()) {
      setErrors(prev => ({ ...prev, firstName: "" }));
    }
  };

  // Фінальна валідація форми перед відправкою замовлення
  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      phone: "",
      lastName: "",
      firstName: ""
    };

    if (!email.trim()) {
      newErrors.email = "Поле Email обов'язкове";
    } else if (!validateEmail(email)) {
      newErrors.email = "Введіть дійсну поштову адресу";
    }

    if (!recipient.phone.trim()) {
      newErrors.phone = "Поле телефон обов'язкове";
    } else if (!validatePhone(recipient.phone)) {
      newErrors.phone = "Введіть дійсний номер мобільного телефону отримувача (мінімум 10 цифр)";
    }

    if (!recipient.lastName.trim()) {
      newErrors.lastName = "Введіть прізвище отримувача";
    }

    if (!recipient.firstName.trim()) {
      newErrors.firstName = "Введіть ім'я отримувача";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(err => err === "");
  };

  // Оформлення замовлення з валідацією та логуванням
  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log("Замовлення готове до відправки", {
        email,
        recipient,
        paymentCategory,
        paymentMethod,
        cartItems,
        totalPrice
      });

      alert("Замовлення успішно оформлено!");
      setShowCart(false);
      setCartItems([]);
      setEmail("");
      setRecipient({ lastName: "", firstName: "", patronymic: "", phone: "+38 " });
    } catch (err) {
      console.error("Помилка:", err);
    }
  };

  // ==================== ІНТЕРФЕЙС ====================
  return (
    <div className="page-wrapper">
      {/* Шапка сайту */}
      <header className="header">
        <h1
          className="header-title"
          onClick={() => {
            resetFilters();
            router.push("/");
          }}
        >
          NovaTech
        </h1>

        {/* Пошук товарів */}
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

            {/* Списки пропозицій */}
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

        {/* Кнопки профілю та корзини */}
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

      {/* Основна сторінка */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem' }}>
        {/* Бокова панель з категоріями */}
        <aside style={{ width: '16rem', flexShrink: 0 }}>
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

          {/* Список категорій */}
          {CATEGORIES.map((cat) => (
            <div key={cat.name} style={{ marginBottom: '1rem' }}>
              <button
                className={`category-btn ${category === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryFilter(cat.name)}
              >
                {cat.label}
              </button>

              {/* Підкатегорії (бренди) */}
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

        {/* Сітка товарів */}
        <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>Завантаження...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && filteredProducts.length === 0 && <p className="empty-state">Товари не знайдені</p>}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="product-card"
            >
              {product.image_url && !loadedImages.has(product.id) ? (
                <Image
                  src={product.image_url}
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

      {/* Модальне вікно корзини */}
      {showCart && (
        <div className="cart-modal-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Ваш кошик</h2>
              <button 
                onClick={() => setShowCart(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="empty-state">Кошик пустий</p>
            ) : (
              <div className="cart-content">
                {/* Товари в кошику */}
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
                          Видалити з кошика
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Форма оформлення замовлення */}
                <div className="cart-form">
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      maxLength={100}
                      className="form-input"
                      style={{ borderColor: errors.email ? '#dc2626' : 'initial' }}
                    />
                    {errors.email && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.email}</p>}
                  </div>

                  {/* Дані отримувача */}
                  <div className="form-group">
                    <label><strong>Отримувач</strong></label>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div>
                        <input
                          type="text"
                          placeholder="Прізвище"
                          value={recipient.lastName}
                          onChange={(e) => handleLastNameChange(e.target.value)}
                          maxLength={50}
                          className="form-input"
                          style={{ borderColor: errors.lastName ? '#dc2626' : 'initial' }}
                        />
                        {errors.lastName && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.lastName}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Ім'я"
                          value={recipient.firstName}
                          onChange={(e) => handleFirstNameChange(e.target.value)}
                          maxLength={50}
                          className="form-input"
                          style={{ borderColor: errors.firstName ? '#dc2626' : 'initial' }}
                        />
                        {errors.firstName && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.firstName}</p>}
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="По батькові"
                      value={recipient.patronymic}
                      onChange={(e) => setRecipient(prev => ({ ...prev, patronymic: e.target.value }))}
                      maxLength={50}
                      className="form-input"
                      style={{ marginTop: '0.5rem' }}
                    />
                    
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="+38 0__ ___ __ __"
                      value={recipient.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={17}
                      className="form-input"
                      style={{ 
                        marginTop: '0.5rem', 
                        borderColor: errors.phone ? '#dc2626' : 'initial',
                        color: '#000',
                        fontSize: '1rem'
                      }}
                    />
                    {errors.phone && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.phone}</p>}
                  </div>

                  {/* Способи оплати */}
                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label style={{ marginBottom: '0.75rem', display: 'block' }}><strong>Оплата</strong></label>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.75rem', cursor: 'pointer', borderRight: paymentCategory === "on_delivery" ? '3px solid #dc2626' : 'none' }}
                      onClick={() => setPaymentCategory("on_delivery")}
                    >
                      <input
                        type="radio"
                        id="delivery"
                        name="payment_category"
                        value="on_delivery"
                        checked={paymentCategory === "on_delivery"}
                        onChange={(e) => setPaymentCategory(e.target.value)}
                        style={{ marginTop: '0.25rem', flexShrink: 0 }}
                      />
                      <label htmlFor="delivery" style={{ margin: 0, cursor: 'pointer' }}>Оплата під час отримання товару</label>
                    </div>

                    <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer', borderRight: paymentCategory === "pay_now" ? '3px solid #dc2626' : 'none' }}
                        onClick={() => setPaymentCategory("pay_now")}
                      >
                        <input
                          type="radio"
                          id="pay_now"
                          name="payment_category"
                          value="pay_now"
                          checked={paymentCategory === "pay_now"}
                          onChange={(e) => setPaymentCategory(e.target.value)}
                          style={{ marginTop: '0.25rem', flexShrink: 0 }}
                        />
                        <label htmlFor="pay_now" style={{ margin: 0, cursor: 'pointer' }}><strong>Оплата карткою</strong></label>
                      </div>

                      {paymentCategory === "pay_now" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', paddingLeft: '1.5rem', borderTop: '1px solid #ddd' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="payment_method"
                              value="card"
                              checked={paymentMethod === "card"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            Картою
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="payment_method"
                              value="google_pay"
                              checked={paymentMethod === "google_pay"}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            Google Pay
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
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

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', flexDirection: 'column', borderRight: paymentCategory === "credit" ? '3px solid #dc2626' : 'none' }}
                      onClick={() => setPaymentCategory("credit")}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <input
                          type="radio"
                          id="credit"
                          name="payment_category"
                          value="credit"
                          checked={paymentCategory === "credit"}
                          onChange={(e) => setPaymentCategory(e.target.value)}
                          style={{ marginTop: '0.25rem', flexShrink: 0 }}
                        />
                        <label htmlFor="credit" style={{ margin: 0, cursor: 'pointer' }}>Кредит та оплата частинами</label>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, marginLeft: '1.75rem' }}>
                        Оформлення кредитів у банках партнерів
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Підсумок замовлення */}
            {cartItems.length > 0 && (
              <div className="cart-total">
                <p><strong>Всього: {formatPrice(totalPrice)}</strong></p>
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Оформити замовлення
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}