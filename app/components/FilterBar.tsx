"use client";

import { formatPrice } from "@/src/lib/validation";

interface FilterBarProps {
  priceRange: [number, number];
  minPriceInput: string;
  maxPriceInput: string;
  sortBy: "price-asc" | "price-desc" | "name" | "newest";
  onPriceChange: (min: number, max: number) => void;
  onMinPriceInputChange: (val: string) => void;
  onMaxPriceInputChange: (val: string) => void;
  onSortChange: (sort: "price-asc" | "price-desc" | "name" | "newest") => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onFilterClick: () => void;
}

export function FilterBar({
  priceRange,
  minPriceInput,
  maxPriceInput,
  sortBy,
  onPriceChange,
  onMinPriceInputChange,
  onMaxPriceInputChange,
  onSortChange,
  hasActiveFilters,
  onResetFilters,
  onFilterClick
}: FilterBarProps) {
  return (
    <div style={{
      padding: '1.25rem 1.5rem',
      backgroundColor: '#f9f9f9',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
      flexWrap: 'wrap',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Кнопка расширенных фільтрів */}
      <button
        onClick={onFilterClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.7rem 1.2rem',
          backgroundColor: hasActiveFilters ? 'var(--color-primary)' : '#fff',
          color: hasActiveFilters ? 'white' : '#333',
          border: hasActiveFilters ? 'none' : '1.5px solid #ddd',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
          boxShadow: hasActiveFilters ? '0 2px 8px rgba(59, 130, 246, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLButtonElement;
          if (!hasActiveFilters) {
            target.style.borderColor = '#999';
          }
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLButtonElement;
          if (!hasActiveFilters) {
            target.style.borderColor = '#ddd';
          }
        }}
      >
        ⚙️ Розширені фільтри
        {hasActiveFilters && (
          <span style={{
            backgroundColor: '#ff6b6b',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 'bold'
          }}>
            ✓
          </span>
        )}
      </button>

      {/* Розділювач */}
      <div style={{
        width: '1px',
        height: '35px',
        backgroundColor: '#ddd'
      }} />

      {/* Сортування */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <label style={{
          fontWeight: '600',
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          color: '#333'
        }}>
          💰 Сортування:
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "price-asc" | "price-desc" | "name" | "newest")}
          style={{
            padding: '0.65rem 0.9rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            cursor: 'pointer',
            backgroundColor: 'white',
            fontWeight: '500',
            transition: 'border-color 0.2s ease',
            minWidth: '200px'
          }}
        >
          <option value="price-asc">Ціна: менше → більше</option>
          <option value="price-desc">Ціна: більше → менше</option>
          <option value="name">Назва: A-Z</option>
          <option value="newest">Новіші спочатку</option>
        </select>
      </div>

      {/* Фільтр по цені */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        <label style={{
          fontWeight: '600',
          fontSize: '0.9rem',
          whiteSpace: 'nowrap',
          color: '#333'
        }}>
          💵 Ціна:
        </label>
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
            padding: '0.65rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            width: '95px',
            fontWeight: '500',
            transition: 'border-color 0.2s ease'
          }}
        />
        <span style={{
          color: '#999',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          —
        </span>
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
            padding: '0.65rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            width: '95px',
            fontWeight: '500',
            transition: 'border-color 0.2s ease'
          }}
        />
      </div>

      {/* Кнопка очистити */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          style={{
            padding: '0.65rem 1.2rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
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
          ✕ Очистити фільтри
        </button>
      )}
    </div>
  );
}