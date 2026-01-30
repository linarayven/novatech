"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/src/lib/validation";

interface SpecFilter {
  [key: string]: Set<string>;
}

interface FilterModalProps {
  isOpen: boolean;
  priceRange: [number, number];
  minPriceInput: string;
  maxPriceInput: string;
  sortBy: "price-asc" | "price-desc" | "name" | "newest";
  specFilters: SpecFilter;
  availableSpecs: { [key: string]: Set<string> };
  onPriceChange: (min: number, max: number) => void;
  onMinPriceInputChange: (val: string) => void;
  onMaxPriceInputChange: (val: string) => void;
  onSortChange: (sort: "price-asc" | "price-desc" | "name" | "newest") => void;
  onSpecFilterChange: (specName: string, value: string, checked: boolean) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onClose: () => void;
}

export function FilterModal({
  isOpen,
  priceRange,
  minPriceInput = "0",
  maxPriceInput = "100000",
  sortBy,
  specFilters,
  availableSpecs,
  onPriceChange,
  onMinPriceInputChange,
  onMaxPriceInputChange,
  onSortChange,
  onSpecFilterChange,
  hasActiveFilters,
  onResetFilters,
  onClose
}: FilterModalProps) {
  // Блокируем скролл при открытом модале
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Фон */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease'
        }}
      />

      {/* Модальное окно */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '500px',
          height: '100vh',
          backgroundColor: 'white',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
          animation: 'slideInRight 0.3s ease'
        }}
      >
        {/* Заголовок */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
            🔍 Фільтри
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#666',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.color = '#666';
            }}
          >
            ✕
          </button>
        </div>

        {/* Контент фильтров */}
        <div style={{ padding: '1.5rem' }}>
          {/* Сортировка */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '1rem', display: 'block', marginBottom: '0.75rem', color: '#333' }}>
              💰 Сортировка:
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as "price-asc" | "price-desc" | "name" | "newest")}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'border-color 0.2s ease'
              }}
            >
              <option value="price-asc">💰 Цена: менше → більше</option>
              <option value="price-desc">💰 Цена: більше → менше</option>
              <option value="name">🔤 Назва: A-Z</option>
              <option value="newest">✨ Новіші спочатку</option>
            </select>
          </div>

          {/* Фільтр по цені */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '1rem', display: 'block', marginBottom: '0.75rem', color: '#333' }}>
              💵 Ціна:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <input
                type="number"
                placeholder="Мін"
                value={minPriceInput}
                onChange={(e) => {
                  onMinPriceInputChange(e.target.value);
                  const num = e.target.value ? parseInt(e.target.value) : 0;
                  onPriceChange(num, priceRange[1]);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '0.95rem',
                  flex: 1,
                  fontWeight: '500'
                }}
              />
              <span style={{ color: '#666' }}>—</span>
              <input
                type="number"
                placeholder="Макс"
                value={maxPriceInput}
                onChange={(e) => {
                  onMaxPriceInputChange(e.target.value);
                  const num = e.target.value ? parseInt(e.target.value) : 100000;
                  onPriceChange(priceRange[0], num);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '0.95rem',
                  flex: 1,
                  fontWeight: '500'
                }}
              />
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500', color: '#555' }}>
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </div>
          </div>

          {/* Розширені фільтри */}
          {availableSpecs && Object.keys(availableSpecs).length > 0 && (
            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                ⚙️ Розширені фільтри
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(availableSpecs).map(([specName, values]) => (
                  <div key={specName}>
                    <h4 style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      {specName}
                      {specFilters[specName]?.size > 0 && (
                        <span style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {specFilters[specName].size}
                        </span>
                      )}
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      {Array.from(values).sort().map((value) => {
                        const isChecked = specFilters[specName]?.has(value) || false;
                        return (
                          <label key={value} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            backgroundColor: isChecked ? '#e8f5e9' : 'transparent',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => onSpecFilterChange(specName, value, e.target.checked)}
                              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                            />
                            <span style={{ fontWeight: isChecked ? '600' : '400', color: '#333' }}>
                              {value}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки внизу */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '1rem',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          zIndex: 10
        }}>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                target.style.backgroundColor = '#dc2626';
              }}
            >
              ✕ Очистити
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              transition: 'filter 0.2s ease'
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLButtonElement;
              target.style.filter = 'brightness(1)';
            }}
          >
            ✓ Готово
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}