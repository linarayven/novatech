"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  price: number;
}

interface HeaderProps {
  user: { id: string; email?: string } | null;
  searchText: string;
  onSearchChange: (text: string) => void;
  onSearchSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions: Product[];
  onSuggestionClick: (title: string) => void;
  onProfileClick: () => void;
  onCartClick: () => void;
  totalItems: number;
  onResetFilters: () => void;
}

export function Header({
  user,
  searchText,
  onSearchChange,
  onSearchSubmit,
  onKeyPress,
  suggestions,
  onSuggestionClick,
  onProfileClick,
  onCartClick,
  totalItems,
  onResetFilters
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <header className="header">
      <h1
        className="header-title"
        onClick={() => {
          onResetFilters();
          router.push("/");
        }}
      >
        NovaTech
      </h1>

      <div className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Пошук товарів..."
            aria-label="Пошук товарів"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onKeyPress}
            ref={inputRef}
            className="search-input"
          />

          <button
            className="search-btn"
            onClick={onSearchSubmit}
            aria-label="Пошук"
          >
            🔍
          </button>

          {suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="suggestion-item"
                  onClick={() => {
                    onSuggestionClick(s.title);
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

      <div className="header-actions">
        <button
          aria-label="Профіль"
          className="icon-btn"
          onClick={onProfileClick}
          title={user ? "Перейти до профілю" : "Увійти"}
        >
          👤
        </button>
        <button
          aria-label="Корзина"
          className="icon-btn"
          onClick={onCartClick}
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
  );
}