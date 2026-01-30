import Image from "next/image";
import { Product } from "@/src/lib/filters";
import { formatPrice } from "@/src/lib/validation";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadedImages: Set<string>;
  wishlist: Set<string>;
  onImageError: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onProductClick: (product: Product) => void;
}

export function ProductGrid({
  products,
  loading,
  error,
  loadedImages,
  wishlist,
  onImageError,
  onAddToCart,
  onToggleWishlist,
  onProductClick
}: ProductGridProps) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '1.5rem',
      width: '100%'
    }}>
      {loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>Завантаження...</p>}
      {error && <p className="error-message" style={{ gridColumn: '1 / -1' }}>{error}</p>}
      {!loading && products.length === 0 && <p className="empty-state" style={{ gridColumn: '1 / -1' }}>Товари не знайдені</p>}

      {products.map((product) => (
        <div
          key={product.id}
          className="product-card"
          style={{ 
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onClick={() => onProductClick(product)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        >
          {/* Контейнер изображения */}
          <div style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f5f5f5',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Кнопка "В избранное" */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '50%',
                width: '2.5rem',
                height: '2.5rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10,
                color: wishlist.has(product.id) ? '#dc2626' : '#ccc'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = wishlist.has(product.id) ? '#fecaca' : '#f5f5f5';
                e.currentTarget.style.borderColor = wishlist.has(product.id) ? '#dc2626' : '#999';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#ddd';
              }}
              title={wishlist.has(product.id) ? "Видалити з бажань" : "Додати в бажання"}
            >
              {wishlist.has(product.id) ? '♥' : '♡'}
            </button>

            {product.image_url && !loadedImages.has(product.id) ? (
              <Image
                src={product.image_url}
                alt={product.title}
                width={300}
                height={200}
                onError={() => onImageError(product.id)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e5e5e5',
                color: '#999',
                fontSize: '1rem'
              }}>
                📦 Немає зображення
              </div>
            )}
          </div>

          {/* Контент карточки - растягивается и заполняет место */}
          <div style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            <h2 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#333',
              lineHeight: '1.4'
            }}>
              {product.title}
            </h2>

            <p style={{
              margin: '0.5rem 0',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#ff6b35'
            }}>
              {formatPrice(product.price)}
            </p>

            <p style={{
              margin: '0.25rem 0',
              fontSize: '0.9rem',
              color: '#666'
            }}>
              Категорія: {product.category}
            </p>

            {product.brand && (
              <p style={{
                margin: '0.25rem 0',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                Бренд: {product.brand}
              </p>
            )}

            {/* Пустое место чтобы кнопка была внизу */}
            <div style={{ flex: 1 }} />

            {/* Кнопка добавления - всегда внизу */}
            <button 
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '1rem',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e55a1f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6b35';
              }}
            >
              Додати в корзину
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}