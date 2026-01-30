"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { 
  Product, 
  getAllAvailableSpecs
} from "@/src/lib/filters";
import { 
  validateEmail, 
  validatePhone,
  filterEmailInput,
  formatPhoneInput,
  filterLastNameInput,
  filterFirstNameInput
} from "@/src/lib/validation";
import { parseFullName, formatFullName } from "@/src/lib/nameHelper";
import { useProducts } from "@/app/hooks/useProducts";
import { useCart } from "@/app/hooks/useCart";
import { Header } from "@/app/components/Header";
import { Sidebar } from "@/app/components/Sidebar";
import { FilterModal } from "@/app/components/FilterModal";
import { FilterBar } from "@/app/components/FilterBar";
import { ProductGrid } from "@/app/components/ProductGrid";
import { CartModal } from "@/app/components/CartModal";
import { ProductDetailsModal } from "@/app/components/ProductDetailsModal";

type ProductDetail = Product;

interface AuthUser {
  id: string;
  email?: string;
}

interface Recipient {
  lastName: string;
  firstName: string;
  patronymic: string;
  phone: string;
}

interface FormErrors {
  email: string;
  phone: string;
  lastName: string;
  firstName: string;
}

// Функция для применения фильтров по спецификациям
function applySpecFilters(
  products: Product[],
  specFilters: { [key: string]: Set<string> }
): Product[] {
  if (Object.keys(specFilters).length === 0) {
    return products;
  }

  return products.filter((product) => {
    // Если specs это JSON объект, парси его
    const productSpecs = typeof product.specs === 'string' 
      ? JSON.parse(product.specs) 
      : product.specs || {};

    // Проверяем каждый активный фильтр
    return Object.entries(specFilters).every(([specName, selectedValues]) => {
      if (selectedValues.size === 0) return true;

      // Получаем значение спеки из продукта
      const specValue = productSpecs[specName];
      
      if (!specValue) return false;

      // Если это массив (может быть), преобразуем в строку для сравнения
      const specValueStr = Array.isArray(specValue) 
        ? specValue.join(', ')
        : String(specValue);

      // Проверяем, содержится ли значение в выбранных
      return Array.from(selectedValues).some(val => 
        specValueStr.toLowerCase().includes(val.toLowerCase())
      );
    });
  });
}

export default function Home() {
  const router = useRouter();

  // Хуки
  const { products, loading, error: productsError } = useProducts();
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    totalPrice,
    totalItems
  } = useCart();
  const [category, setCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [paymentCategory, setPaymentCategory] = useState<string>("on_delivery");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minPriceInput, setMinPriceInput] = useState<string>("0");
  const [maxPriceInput, setMaxPriceInput] = useState<string>("100000");
  
  // Убедимся что значения всегда определены
  const safeMinPriceInput = minPriceInput ?? "0";
  const safeMaxPriceInput = maxPriceInput ?? "100000";
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name" | "newest">("newest");
  const [specFilters, setSpecFilters] = useState<{ [key: string]: Set<string> }>({});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [recipient, setRecipient] = useState<Recipient>({
    lastName: "",
    firstName: "",
    patronymic: "",
    phone: "+38 "
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: "",
    phone: "",
    lastName: "",
    firstName: ""
  });
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // Загрузка сесії та профіля
  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user as AuthUser);
          setEmail(session.user.email || "");
          
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileData) {
            const { firstName, patronymic, lastName } = parseFullName(profileData.full_name || "");
            
            setRecipient((prev) => ({
              ...prev,
              firstName: firstName || "",
              patronymic: patronymic || "",
              lastName: lastName || "",
              phone: profileData.phone || "+38 "
            }));
          }
          
          const { data: wishlistData } = await supabase
            .from("wishlist")
            .select("product_id")
            .eq("user_id", session.user.id);
          
          if (wishlistData) {
            setWishlist(new Set(wishlistData.map((w: { product_id: string }) => w.product_id)));
          }
        }
      } catch (err) {
        console.error("Помилка завантаження даних користувача:", err);
      }
    }
    loadUserData();
  }, []);

  // Дебаунс пошукового тексту
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Применение всех фильтров: цена, сортировка, спеки
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    // Начинаем с исходных продуктов
    let filtered = [...products];

    // Применяем фильтр по цене
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Применяем фильтры по спецификациям
    filtered = applySpecFilters(filtered, specFilters);

    // Применяем сортировку
    if (sortBy === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    setFilteredProducts(filtered);
  }, [products, priceRange, sortBy, specFilters]);

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

  // Мемоизація
  const subCategories = useMemo(() => {
    if (!category) return [];
    return Array.from(new Set(products.filter((p) => p.category === category).map((p) => p.brand)))
      .filter((brand): brand is string => brand !== undefined && brand !== '') as string[];
  }, [category, products]);

  const availableSpecs = useMemo(() => {
    const specs = getAllAvailableSpecs(products);
    // Конвертуємо масиви в Sets щоб збігалися з типом FilterModal
    const specsAsSet: { [key: string]: Set<string> } = {};
    
    Object.entries(specs).forEach(([key, values]) => {
      specsAsSet[key] = new Set(values);
    });
    
    return specsAsSet;
  }, [products]);

  const hasActiveFilters = !!(category || priceRange[0] > 0 || priceRange[1] < 100000 || sortBy !== "newest" || Object.keys(specFilters).length > 0);

  // Обробники
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
    setFilteredProducts(products.filter((p) => p.category === cat));
  }, [products]);

  const handleSubCategoryFilter = useCallback((sub: string, cat: string) => {
    setSubCategory(sub);
    setFilteredProducts(products.filter((p) => p.category === cat && p.brand === sub));
  }, [products]);

  const handleSpecFilterChange = useCallback((specName: string, value: string, checked: boolean) => {
    setSpecFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[specName]) {
        newFilters[specName] = new Set();
      }
      if (checked) {
        newFilters[specName].add(value);
      } else {
        newFilters[specName].delete(value);
      }
      return newFilters;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setCategory(null);
    setSubCategory(null);
    setSearchText("");
    setSuggestions([]);
    setFilteredProducts(products);
    setPriceRange([0, 100000]);
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    setSortBy("newest");
    setSpecFilters({});
  }, [products]);

  const handleImageError = (productId: string) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  };

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      const isInWishlist = wishlist.has(productId);

      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;
        
        setWishlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;
        setWishlist((prev) => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error("Помилка при роботі зі списком бажань:", err);
    }
  }, [user, wishlist, router]);

  const handleProfileClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      router.push("/profile");
    } else {
      router.push("/auth");
    }
  };

  const handleEmailChange = (value: string) => {
    const filtered = filterEmailInput(value);
    setEmail(filtered);
    
    if (filtered && !validateEmail(filtered)) {
      setErrors((prev) => ({ ...prev, email: "Введіть дійсну поштову адресу" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    setRecipient((prev) => ({ ...prev, phone: formatted }));
    
    const digitsOnly = formatted.replace(/\D/g, '');
    if (digitsOnly.length === 12 && !validatePhone(formatted)) {
      setErrors((prev) => ({ ...prev, phone: "Введіть дійсний номер мобільного телефону отримувача" }));
    } else if (digitsOnly.length === 12) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleLastNameChange = (value: string) => {
    const filtered = filterLastNameInput(value);
    setRecipient((prev) => ({ ...prev, lastName: filtered }));
    if (filtered.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "" }));
    }
  };

  const handleFirstNameChange = (value: string) => {
    const filtered = filterFirstNameInput(value);
    setRecipient((prev) => ({ ...prev, firstName: filtered }));
    if (filtered.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
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
    return Object.values(newErrors).every((err) => err === "");
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    setSavingOrder(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const orderData = {
        user_id: session?.user.id || null,
        email: email || session?.user.email || "",
        recipient: {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          patronymic: recipient.patronymic || ""
        },
        phone: recipient.phone,
        items: cartItems.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        total_price: totalPrice,
        payment_category: paymentCategory,
        payment_method: paymentMethod,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("order_history")
        .insert([orderData]);

      if (error) {
        console.error("Помилка збереження замовлення:", error);
        console.error("Деталі помилки:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Помилка при оформленні замовлення:\n${error.message || 'Спробуйте ще раз.'}`);
        return;
      }

      // Обновляем профиль пользователя если зареєстрований
      if (session?.user.id) {
        const fullName = formatFullName(recipient.firstName, recipient.patronymic, recipient.lastName);
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: recipient.firstName,
            patronymic: recipient.patronymic || null,
            last_name: recipient.lastName,
            full_name: fullName,
            phone: recipient.phone
          })
          .eq("id", session.user.id);

        if (profileError) {
          console.error("Помилка оновлення профілю:", profileError);
          // Не прерываем процесс заказа если ошибка в профиле
        }

        const productIds = cartItems.map((item) => item.id);
        const { error: deleteError } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", session.user.id)
          .in("product_id", productIds);

        if (!deleteError) {
          setWishlist((prev) => {
            const newSet = new Set(prev);
            productIds.forEach((id) => newSet.delete(id));
            return newSet;
          });
        }
      }

      console.log("Замовлення успішно збережено!");
      alert("Замовлення успішно оформлено!");
      
      setShowCart(false);
      clearCart();
      setEmail(session?.user.email || "");
      setRecipient({ lastName: "", firstName: "", patronymic: "", phone: "+38 " });
      setErrors({ email: "", phone: "", lastName: "", firstName: "" });
    } catch (err) {
      console.error("Помилка:", err);
      alert("Помилка при оформленні замовлення");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Header
        user={user}
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchSubmit={handleSearch}
        onKeyPress={handleKeyPress}
        suggestions={suggestions}
        onSuggestionClick={(title: string) => {
          setSearchText(title);
          setFilteredProducts(products.filter((p) => p.title === title));
          setSuggestions([]);
        }}
        onProfileClick={handleProfileClick}
        onCartClick={() => setShowCart(!showCart)}
        totalItems={totalItems}
        onResetFilters={resetFilters}
      />

      {/* Фільтр бар */}
      <FilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        onFilterClick={() => setShowFilters(true)}
        priceRange={priceRange}
        hasActiveFilters={hasActiveFilters}
        minPriceInput={safeMinPriceInput}
        maxPriceInput={safeMaxPriceInput}
        onPriceChange={(min: number, max: number) => setPriceRange([min, max])}
        onMinPriceInputChange={setMinPriceInput}
        onMaxPriceInputChange={setMaxPriceInput}
        onResetFilters={resetFilters}
      />

      {/* Фільтр модал */}
      <FilterModal
        isOpen={showFilters}
        priceRange={priceRange}
        minPriceInput={minPriceInput}
        maxPriceInput={maxPriceInput}
        sortBy={sortBy}
        specFilters={specFilters}
        availableSpecs={availableSpecs}
        onPriceChange={(min: number, max: number) => setPriceRange([min, max])}
        onMinPriceInputChange={setMinPriceInput}
        onMaxPriceInputChange={setMaxPriceInput}
        onSortChange={setSortBy}
        onSpecFilterChange={handleSpecFilterChange}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Основна сітка: категорії слева, товари справа */}
      <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem' }}>
        <Sidebar
          category={category}
          subCategory={subCategory}
          subCategories={subCategories}
          onCategoryFilter={handleCategoryFilter}
          onSubCategoryFilter={handleSubCategoryFilter}
          onBreadcrumbClick={(cat?: string) => {
            if (cat) handleCategoryFilter(cat);
            else resetFilters();
          }}
        />

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          error={productsError}
          loadedImages={loadedImages}
          wishlist={wishlist}
          onImageError={handleImageError}
          onAddToCart={addToCart}
          onToggleWishlist={toggleWishlist}
          onProductClick={(product: Product) => {
            if (isClosingModal) return;
            setSelectedProduct(product as ProductDetail);
          }}
        />
      </div>

      <CartModal
        isOpen={showCart}
        cartItems={cartItems}
        totalPrice={totalPrice}
        email={email}
        recipient={recipient}
        paymentCategory={paymentCategory}
        paymentMethod={paymentMethod}
        errors={errors}
        savingOrder={savingOrder}
        onClose={() => setShowCart(false)}
        onEmailChange={handleEmailChange}
        onPhoneChange={handlePhoneChange}
        onLastNameChange={handleLastNameChange}
        onFirstNameChange={handleFirstNameChange}
        onPatronymicChange={(value: string) => setRecipient((prev) => ({ ...prev, patronymic: value }))}
        onQuantityChange={updateQuantity}
        onRemoveItem={removeFromCart}
        onPaymentCategoryChange={setPaymentCategory}
        onPaymentMethodChange={setPaymentMethod}
        onCheckout={handleCheckout}
      />

      {selectedProduct && !isClosingModal && (
        <ProductDetailsModal
          product={selectedProduct as Product}
          loadedImages={loadedImages}
          isInWishlist={wishlist.has(selectedProduct.id)}
          onImageError={handleImageError}
          onAddToCart={() => {
            addToCart(selectedProduct as Product);
            setSelectedProduct(null);
          }}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
          onClose={() => {
            setIsClosingModal(true);
            setSelectedProduct(null);
            setTimeout(() => setIsClosingModal(false), 100);
          }}
        />
      )}
    </div>
  );
}