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

  // ==================== JSX ====================
  return (
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

            {/* Автоподсказки */}
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
          >
            🛒
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
              <button className="add-to-cart-btn">Додати в корзину</button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
