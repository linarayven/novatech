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
    <main style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
      {loading && <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '2rem' }}>Завантаження...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && products.length === 0 && <p className="empty-state">Товари не знайдені</p>}

      {products.map((product) => (
        <div
          key={product.id}
          className="product-card"
          style={{ 
            position: 'relative',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onClick={() => onProductClick(product)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
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
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              📦 Немає зображення
            </div>
          )}

          <h2 className="product-title">{product.title}</h2>
          <p className="product-price">Ціна: {formatPrice(product.price)}</p>
          <p className="product-category">Категорія: {product.category}</p>
          {product.brand && <p className="product-brand">Бренд: {product.brand}</p>}
          
          <button 
            className="add-to-cart-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            Додати в корзину
          </button>
        </div>
      ))}
    </main>
  );
}