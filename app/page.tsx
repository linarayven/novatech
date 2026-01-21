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
    <div className="min-h-screen bg-[#c9d1c8] text-[#04202c]">
      {/* ====== Хедер ====== */}
      <header className="bg-[#ffffff] shadow p-4 flex items-center justify-between">
        {/* NovaTech */}
        <h1
          className="text-2xl font-bold text-[#304040] cursor-pointer"
          onClick={() => {
            resetFilters();
            router.push("/");
          }}
        >
          NovaTech
        </h1>

        {/* Пошук */}
        <div className="flex-1 flex justify-center relative">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Пошук товарів..."
              aria-label="Пошук товарів"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyPress}
              ref={inputRef}
              className="border border-[#5b7065] rounded px-3 py-1 pr-10 focus:outline-[#304040] bg-[#ffffff] text-[#04202c] w-full"
            />

            <button
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-white bg-[#304040] rounded hover:bg-[#5b7065] transition"
              onClick={handleSearch}
              aria-label="Пошук"
            >
              🔍
            </button>

            {/* Автоподсказки */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#5b7065] rounded shadow z-10">
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="px-2 py-1 hover:bg-[#5b7065] hover:text-white cursor-pointer"
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
        <div className="flex gap-4 ml-4">
          <button aria-label="Профіль" className="px-3 py-1 rounded bg-[#304040] text-white hover:bg-[#5b7065] transition">👤</button>
          <button aria-label="Корзина" className="px-3 py-1 rounded bg-[#304040] text-white hover:bg-[#5b7065] transition">🛒</button>
        </div>
      </header>

      {/* ==================== Основний контент ==================== */}
      <div className="flex gap-6 p-4">
        {/* ====== Бокова панель ====== */}
        <aside className="w-64 flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="mb-4 text-sm text-[#04202c]">
            <button className="hover:underline" onClick={() => { resetFilters(); router.push("/"); }}>🏠</button>
            {category && (
              <>
                <span className="mx-1">/</span>
                <button className="hover:underline" onClick={() => handleCategoryFilter(category)}>
                  {CATEGORIES.find(c => c.name === category)?.label}
                </button>
              </>
            )}
            {subCategory && (
              <>
                <span className="mx-1">/</span>
                <span>{subCategory}</span>
              </>
            )}
          </div>

          {/* Категорії */}
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="mb-4">
              <button
                className={`font-semibold w-full text-left p-2 rounded ${category === cat.name ? "bg-[#304040] text-white" : "hover:bg-[#5b7065] text-[#04202c]"}`}
                onClick={() => handleCategoryFilter(cat.name)}
              >
                {cat.label}
              </button>

              {category === cat.name && subCategories.length > 0 && (
                <div className="ml-4 mt-2 flex flex-col gap-1">
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      className={`text-left p-1 rounded text-sm ${subCategory === sub ? "bg-[#304040] text-white" : "hover:bg-[#5b7065] text-[#04202c]"}`}
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
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading && <p className="col-span-full text-center mt-8">Завантаження...</p>}
          {error && <p className="col-span-full text-center mt-8 text-red-600">{error}</p>}
          {!loading && filteredProducts.length === 0 && <p className="col-span-full text-center mt-8">Товари не знайдені</p>}

          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-[#ffffff] p-4 rounded shadow hover:shadow-lg border border-[#5b7065] transition">
              {product.image && !loadedImages.has(product.id) ? (
                <Image
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={200}
                  onError={() => handleImageError(product.id)}
                  className="mb-2 rounded w-full object-cover"
                />
              ) : (
                <div className="w-full h-[200px] bg-[#e0e0e0] rounded mb-2 flex items-center justify-center text-[#5b7065]">
                  📦 Немає зображення
                </div>
              )}
              <h2 className="font-bold mb-1">{product.title}</h2>
              <p className="font-semibold mb-1">Ціна: {formatPrice(product.price)}</p>
              <p className="text-sm text-[#304040]">Категорія: {product.category}</p>
              {product.brand && <p className="text-sm text-[#5b7065]">Бренд: {product.brand}</p>}
              <button className="mt-2 w-full py-1 rounded shadow-sm bg-[#304040] text-white hover:bg-[#5b7065] transition">Додати в корзину</button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
