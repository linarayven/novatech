import Image from "next/image";
import { Product } from "@/src/lib/filters";
import { formatPrice } from "@/src/lib/validation";

interface ProductDetailsModalProps {
  product: Product;
  loadedImages: Set<string>;
  isInWishlist: boolean;
  onImageError: (productId: string) => void;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  onClose: () => void;
}

export function ProductDetailsModal({
  product,
  loadedImages,
  isInWishlist,
  onImageError,
  onAddToCart,
  onToggleWishlist,
  onClose
}: ProductDetailsModalProps) {
  return (
    <div 
      className="cart-modal-overlay" 
      onClick={onClose}
      style={{ zIndex: 1000, pointerEvents: 'auto' }}
    >
      <div 
        className="cart-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="cart-header">
          <h2>Деталі товару</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Изображение */}
          <div>
            {product.image_url && !loadedImages.has(product.id) ? (
              <Image
                src={product.image_url}
                alt={product.title}
                width={400}
                height={300}
                onError={() => onImageError(product.id)}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#eee',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem'
              }}>
                📦
              </div>
            )}
          </div>

          {/* Информация */}
          <div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
              {product.title}
            </h2>

            <p style={{ fontSize: '1.8rem', color: 'var(--color-accent-text)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
              {formatPrice(product.price)}
            </p>

            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              {product.brand && (
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  <strong>Бренд:</strong> {product.brand}
                </p>
              )}
              <p style={{ margin: '0.5rem 0', color: '#666' }}>
                <strong>Категорія:</strong> {product.category}
              </p>
              {product.sub_category && (
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  <strong>Підкатегорія:</strong> {product.sub_category}
                </p>
              )}
            </div>

            {product.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Опис</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {product.description}
                </p>
              </div>
            )}

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Характеристики</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <li key={key} style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                      <strong>{key}:</strong> {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={onAddToCart}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e55a24';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ff6b35';
                }}
              >
                Додати в корзину
              </button>
              <button
                onClick={onToggleWishlist}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isInWishlist ? '#fecaca' : '#f0f0f0',
                  color: isInWishlist ? '#dc2626' : '#333',
                  border: `1px solid ${isInWishlist ? '#dc2626' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isInWishlist ? '#fecaca' : '#e0e0e0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isInWishlist ? '#fecaca' : '#f0f0f0';
                }}
              >
                {isInWishlist ? '♥ В бажаннях' : '♡ В бажання'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}