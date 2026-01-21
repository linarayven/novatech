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
  onResetFilters
}: FilterBarProps) {
  return (
    <div style={{ 
      padding: '1rem', 
      backgroundColor: '#f9f9f9', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      {/* Сортировка */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          Сортировка:
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "price-asc" | "price-desc" | "name" | "newest")}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            cursor: 'pointer',
            minWidth: '180px'
          }}
        >
          <option value="price-asc">💰 Цена: менше → більше</option>
          <option value="price-desc">💰 Цена: більше → менше</option>
          <option value="name">🔤 Назва: A-Z</option>
          <option value="newest">✨ Новіші спочатку</option>
        </select>
      </div>

      {/* Фільтр по цені */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <label style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
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
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            width: '70px'
          }}
        />
        <span style={{ color: '#666', fontSize: '0.85rem' }}>—</span>
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
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '0.9rem',
            width: '70px'
          }}
        />
        <span style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>
          {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
        </span>
      </div>

      {/* Кнопка очистить */}
      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          ✕ Очистити
        </button>
      )}
    </div>
  );
}