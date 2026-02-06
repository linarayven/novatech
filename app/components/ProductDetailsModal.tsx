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
        style={{ display: 'flex', flexDirection: 'column', maxWidth: '700px', maxHeight: '90vh' }}
      >
        <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <h2 style={{ margin: 0 }}>Деталі товару</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            {product.image_url && !loadedImages.has(product.id) ? (
              <Image
                src={product.image_url}
                alt={product.title}
                width={400}
                height={260}
                onError={() => onImageError(product.id)}
                style={{ width: '100%', height: '220px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#fff' }}
              />
            ) : (
              <div style={{ width: '100%', height: '220px', backgroundColor: '#eee', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                📦
              </div>
            )}
          </div>

          <div>
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem' }}>{product.title}</h2>

            <p style={{ fontSize: '1.8rem', color: 'var(--color-accent-text)', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
              {formatPrice(product.price)}
            </p>

            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
              {product.brand && (
                <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Бренд:</strong> {product.brand}</p>
              )}
              <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Категорія:</strong> {product.category}</p>
              {product.sub_category && (
                <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Підкатегорія:</strong> {product.sub_category}</p>
              )}
            </div>

            {product.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Опис</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{product.description}</p>
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
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'white', borderTop: '1px solid #eee', boxShadow: '0 -6px 18px rgba(0,0,0,0.06)', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={onAddToCart}
            style={{ flex: '1 1 60%', padding: '0.75rem', backgroundColor: '#ff6b35', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s ease' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e55a24'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ff6b35'; }}
          >
            Додати в корзину
          </button>

          <button
            onClick={onToggleWishlist}
            style={{ flex: '0 0 36%', padding: '0.75rem 1rem', backgroundColor: isInWishlist ? '#fecaca' : '#f0f0f0', color: isInWishlist ? '#dc2626' : '#333', border: isInWishlist ? '1px solid #dc2626' : '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isInWishlist ? '#fecaca' : '#e0e0e0'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isInWishlist ? '#fecaca' : '#f0f0f0'; }}
          >
            {isInWishlist ? '♥ В бажаннях' : '♡ В бажання'}
          </button>
        </div>
      </div>
    </div>
  );
}
