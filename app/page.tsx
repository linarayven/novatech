"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { 
  Product, 
  applyFilters, 
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
import { useProducts } from "@/app/hooks/useProducts";
import { useCart } from "@/app/hooks/useCart";
import { Header } from "@/app/components/Header";
import { Sidebar } from "@/app/components/Sidebar";
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

  // State
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
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
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name" | "newest">("price-asc");
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
            setRecipient((prev) => ({
              ...prev,
              firstName: profileData.full_name?.split(" ")[0] || "",
              lastName: profileData.full_name?.split(" ").slice(1).join(" ") || "",
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

  // ИСПРАВЛЕНО: Правильне застосування фільтрів
  useEffect(() => {
    const filtered = applyFilters(products, priceRange, {}, sortBy);
    setFilteredProducts(filtered);
  }, [products, priceRange, sortBy]);

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
    return getAllAvailableSpecs(filteredProducts);
  }, [filteredProducts]);

  const hasActiveFilters = !!(category || priceRange[0] > 0 || priceRange[1] < 100000 || sortBy !== "price-asc");

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

  const resetFilters = useCallback(() => {
    setCategory(null);
    setSubCategory(null);
    setSearchText("");
    setSuggestions([]);
    setFilteredProducts(products);
    setPriceRange([0, 100000]);
    setMinPriceInput("0");
    setMaxPriceInput("100000");
    setSortBy("price-asc");
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

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setSelectedProduct(product as ProductDetail);
  };

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
      
      if (!session) {
        alert("Будь ласка, авторизуйтеся перед оформленням замовлення");
        router.push("/auth");
        return;
      }

      const orderData = {
        user_id: session.user.id,
        email: email || session.user.email,
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
        .insert([orderData])
        .select();

      if (error) {
        console.error("Помилка збереження замовлення:", error);
        alert("Помилка при оформленні замовлення. Спробуйте ще раз.");
        return;
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

      console.log("Замовлення успішно збережено:", data);
      alert("Замовлення успішно оформлено!");
      
      setShowCart(false);
      clearCart();
      setEmail(session.user.email || "");
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

      {/* Фільтр бар сверху */}
      <FilterBar
        priceRange={priceRange}
        minPriceInput={minPriceInput}
        maxPriceInput={maxPriceInput}
        sortBy={sortBy}
        onPriceChange={(min: number, max: number) => setPriceRange([min, max])}
        onMinPriceInputChange={setMinPriceInput}
        onMaxPriceInputChange={setMaxPriceInput}
        onSortChange={setSortBy}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
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