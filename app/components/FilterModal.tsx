"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/src/lib/validation";

interface FilterModalProps {
  isOpen: boolean;
  priceRange: [number, number];
  minPriceInput: string;
  maxPriceInput: string;
  sortBy: "price-asc" | "price-desc" | "name" | "newest";
  specFilters: Record<string, Set<string>>;
  availableSpecs: Record<string, Set<string>>;
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sorting: true,
    price: true,
  });

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

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  if (!isOpen) return null;

  return (
    <>
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
          animation: 'slideInRight 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
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
              (e.currentTarget as HTMLButtonElement).style.color = '#000';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#666';
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          {/* Сортирование */}
          <div>
            <button
              onClick={() => toggleSection('sorting')}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: 'transparent',
                color: '#333',
                border: 'none',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <span>💰 Сортирование</span>
              <span style={{
                transform: expandedSections['sorting'] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '1.2rem',
                color: 'var(--color-primary)'
              }}>
                ›
              </span>
            </button>

            {expandedSections['sorting'] && (
              <div style={{ padding: '0 1rem 1rem 1rem', backgroundColor: '#fafafa', borderBottom: '1px solid #ddd' }}>
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
                    marginTop: '0.5rem'
                  }}
                >
                  <option value="price-asc">💰 Ціна: менше → більше</option>
                  <option value="price-desc">💰 Ціна: більше → менше</option>
                  <option value="name">🔤 Назва: A-Z</option>
                  <option value="newest">✨ Новіші спочатку</option>
                </select>
              </div>
            )}
          </div>

          {/* Цена */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: 'transparent',
                color: '#333',
                border: 'none',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              <span>💵 Ціна</span>
              <span style={{
                transform: expandedSections['price'] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '1.2rem',
                color: 'var(--color-primary)'
              }}>
                ›
              </span>
            </button>

            {expandedSections['price'] && (
              <div style={{ padding: '1rem', backgroundColor: '#fafafa', borderBottom: '1px solid #ddd' }}>
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
                  <span style={{ color: '#666' }}>–</span>
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
            )}
          </div>

          {/* Расширенные фильтры */}
          {availableSpecs && Object.keys(availableSpecs).length > 0 && (
            <div>
              {Object.entries(availableSpecs).map(([specName, values]) => {
                const valueArray = values instanceof Set ? Array.from(values) : [];
                const sectionKey = `spec_${specName}`;
                const isExpanded = expandedSections[sectionKey];

                return (
                  <div key={specName}>
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'transparent',
                        color: '#333',
                        border: 'none',
                        borderBottom: '1px solid #ddd',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9f9f9';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      </span>
                      <span style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        fontSize: '1.2rem',
                        color: 'var(--color-primary)'
                      }}>
                        ›
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        borderBottom: '1px solid #ddd'
                      }}>
                        {valueArray.sort().map((value) => {
                          const isChecked = specFilters[specName]?.has(value) || false;
                          return (
                            <label
                              key={value}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                backgroundColor: isChecked ? 'white' : 'transparent',
                                transition: 'all 0.15s ease',
                                borderBottom: '1px solid #f5f5f5'
                              }}
                              onMouseEnter={(e) => {
                                if (!isChecked) {
                                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = '#f5f5f5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChecked) {
                                  (e.currentTarget as HTMLLabelElement).style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => onSpecFilterChange(specName, value, e.target.checked)}
                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                              />
                              <span style={{ fontWeight: isChecked ? '600' : '400', color: '#333', fontSize: '0.9rem' }}>
                                {value}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
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
              (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(0.9)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)';
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