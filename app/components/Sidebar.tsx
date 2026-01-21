"use client";

import { CATEGORIES } from "@/src/lib/constants";
import { useState } from "react";
import Image from "next/image";

// Маппинг иконок для категорий
const CATEGORY_ICONS: { [key: string]: string } = {
  'Ноутбуки': '/icons/computer.svg',
  'Смартфоны': '/icons/iphone.svg',
  'Наушники': '/icons/headphones.svg',
  'Фотокамеры': '/icons/camera.svg',
  'Телефони': '/icons/iphone.svg',
  'Телевизори': '/icons/tv.svg',
  'Планшети': '/icons/tablet.svg',
  'Аксессуари': '/icons/shopping-cart.svg',
  'Монітори': '/icons/computer.svg',
  'Ігрові консолі': '/icons/gamepad.svg',
  'Кабелі': '/icons/headphones.svg',
  'Музика': '/icons/music.svg',
};

interface SidebarProps {
  category: string | null;
  subCategory: string | null;
  subCategories: string[];
  onCategoryFilter: (cat: string) => void;
  onSubCategoryFilter: (sub: string, cat: string) => void;
  onBreadcrumbClick: (cat?: string) => void;
}

export function Sidebar({
  category,
  subCategory,
  subCategories,
  onCategoryFilter,
  onSubCategoryFilter,
  onBreadcrumbClick
}: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(category);

  const handleCategoryClick = (catName: string) => {
    setExpandedCategory(expandedCategory === catName ? null : catName);
    onCategoryFilter(catName);
  };

  const getIcon = (catName: string, label: string) => {
    const iconPath = CATEGORY_ICONS[label];
    if (!iconPath) {
      return '📁';
    }
    return iconPath;
  };

  return (
    <aside style={{
      width: '16rem',
      flexShrink: 0,
      maxHeight: '90vh',
      overflowY: 'auto',
      backgroundColor: 'var(--color-card)',
      borderRight: '1px solid var(--color-border)',
      boxShadow: '0 1px 3px var(--color-shadow)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ 
        marginBottom: 0,
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        fontSize: '0.85rem',
        minHeight: '2.5rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <button 
          className="breadcrumb-btn" 
          onClick={() => {
            onBreadcrumbClick();
            setExpandedCategory(null);
          }}
          style={{ 
            fontSize: '1rem',
            color: 'var(--color-text)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
          title="На головну"
        >
          🏠
        </button>
        {category && (
          <>
            <span style={{ margin: '0 0.5rem', color: 'var(--color-text)' }}>/</span>
            <button 
              className="breadcrumb-btn" 
              onClick={() => {
                onBreadcrumbClick(category);
                setExpandedCategory(null);
              }}
              style={{ 
                color: 'var(--color-accent-text)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: 'inherit'
              }}
            >
              {CATEGORIES.find((c: { name: string }) => c.name === category)?.label}
            </button>
          </>
        )}
        {subCategory && (
          <>
            <span style={{ margin: '0 0.5rem', color: 'var(--color-text)' }}>/</span>
            <span style={{ color: 'var(--color-text)', fontSize: 'inherit' }}>{subCategory}</span>
          </>
        )}
      </div>

      {/* Заголовок категорий */}
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-white)'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}>
          Категории
        </h3>
      </div>

      {/* Категорії */}
      <nav>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.name;
          const isExpanded = expandedCategory === cat.name;
          const icon = getIcon(cat.name, cat.label);

          return (
            <div key={cat.name}>
              <button
                onClick={() => handleCategoryClick(cat.name)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text)',
                  border: 'none',
                  borderLeft: 'none',
                  borderRadius: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontWeight: '500',
                  fontSize: '0.95rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f9f9f9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {icon.startsWith('/') ? (
                    <Image 
                      src={icon} 
                      alt={cat.label}
                      width={20}
                      height={20}
                    />
                  ) : (
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                  )}
                  <span>{cat.label}</span>
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

              {/* Підкатегорії (бренди) */}
              {isExpanded && subCategories.length > 0 && (
                <div style={{
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0
                }}>
                  {subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => onSubCategoryFilter(sub, cat.name)}
                      style={{
                        padding: '0.5rem 1rem 0.5rem 2.5rem',
                        backgroundColor: subCategory === sub ? 'var(--color-white)' : 'transparent',
                        color: subCategory === sub ? 'var(--color-primary)' : 'var(--color-gray)',
                        border: 'none',
                        borderLeft: 'none',
                        borderRadius: 0,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        fontWeight: subCategory === sub ? '500' : '400',
                        display: 'block',
                        width: '100%',
                        borderBottom: '1px solid #f5f5f5'
                      }}
                      onMouseEnter={(e) => {
                        if (subCategory !== sub) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (subCategory !== sub) {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}