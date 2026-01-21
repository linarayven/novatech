import { CartItem } from "@/app/hooks/useCart";
import { formatPrice } from "@/src/lib/validation";

interface CartModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  totalPrice: number;
  email: string;
  recipient: {
    lastName: string;
    firstName: string;
    patronymic: string;
    phone: string;
  };
  paymentCategory: string;
  paymentMethod: string;
  errors: {
    email: string;
    phone: string;
    lastName: string;
    firstName: string;
  };
  savingOrder: boolean;
  onClose: () => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onPatronymicChange: (value: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onPaymentCategoryChange: (category: string) => void;
  onPaymentMethodChange: (method: string) => void;
  onCheckout: () => void;
}

export function CartModal({
  isOpen,
  cartItems,
  totalPrice,
  email,
  recipient,
  paymentCategory,
  paymentMethod,
  errors,
  savingOrder,
  onClose,
  onEmailChange,
  onPhoneChange,
  onLastNameChange,
  onFirstNameChange,
  onPatronymicChange,
  onQuantityChange,
  onRemoveItem,
  onPaymentCategoryChange,
  onPaymentMethodChange,
  onCheckout
}: CartModalProps) {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Ваш кошик</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="empty-state">Кошик пустий</p>
        ) : (
          <div className="cart-content">
            {/* Товари в кошику */}
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>
                    <p className="cart-item-title">{item.title}</p>
                    <p className="cart-item-price">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="cart-item-controls">
                    <button 
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      className="cart-qty-btn"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      className="cart-qty-btn"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="cart-remove-btn"
                    >
                      Видалити з кошика
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Форма оформлення */}
            <div className="cart-form">
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  maxLength={100}
                  className="form-input"
                  style={{ borderColor: errors.email ? '#dc2626' : 'initial' }}
                />
                {errors.email && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.email}</p>}
              </div>

              <div className="form-group">
                <label><strong>Отримувач</strong></label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Прізвище"
                      value={recipient.lastName}
                      onChange={(e) => onLastNameChange(e.target.value)}
                      maxLength={50}
                      className="form-input"
                      style={{ borderColor: errors.lastName ? '#dc2626' : 'initial' }}
                    />
                    {errors.lastName && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.lastName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Ім'я"
                      value={recipient.firstName}
                      onChange={(e) => onFirstNameChange(e.target.value)}
                      maxLength={50}
                      className="form-input"
                      style={{ borderColor: errors.firstName ? '#dc2626' : 'initial' }}
                    />
                    {errors.firstName && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.firstName}</p>}
                  </div>
                </div>
                
                <input
                  type="text"
                  placeholder="По батькові"
                  value={recipient.patronymic}
                  onChange={(e) => onPatronymicChange(e.target.value)}
                  maxLength={50}
                  className="form-input"
                  style={{ marginTop: '0.5rem' }}
                />
                
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="+38 0__ ___ __ __"
                  value={recipient.phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  maxLength={17}
                  className="form-input"
                  style={{ 
                    marginTop: '0.5rem', 
                    borderColor: errors.phone ? '#dc2626' : 'initial',
                    color: '#000',
                    fontSize: '1rem'
                  }}
                />
                {errors.phone && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>{errors.phone}</p>}
              </div>

              {/* Способи оплати */}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}><strong>Оплата</strong></label>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.75rem', cursor: 'pointer' }}
                  onClick={() => onPaymentCategoryChange("on_delivery")}
                >
                  <input
                    type="radio"
                    id="delivery"
                    name="payment_category"
                    value="on_delivery"
                    checked={paymentCategory === "on_delivery"}
                    onChange={(e) => onPaymentCategoryChange(e.target.value)}
                    style={{ marginTop: '0.25rem', flexShrink: 0 }}
                  />
                  <label htmlFor="delivery" style={{ margin: 0, cursor: 'pointer' }}>Оплата під час отримання товару</label>
                </div>

                <div style={{ border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}
                    onClick={() => onPaymentCategoryChange("pay_now")}
                  >
                    <input
                      type="radio"
                      id="pay_now"
                      name="payment_category"
                      value="pay_now"
                      checked={paymentCategory === "pay_now"}
                      onChange={(e) => onPaymentCategoryChange(e.target.value)}
                      style={{ marginTop: '0.25rem', flexShrink: 0 }}
                    />
                    <label htmlFor="pay_now" style={{ margin: 0, cursor: 'pointer' }}><strong>Оплата карткою</strong></label>
                  </div>

                  {paymentCategory === "pay_now" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', paddingLeft: '1.5rem', borderTop: '1px solid #ddd' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => onPaymentMethodChange(e.target.value)}
                        />
                        Картою
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="google_pay"
                          checked={paymentMethod === "google_pay"}
                          onChange={(e) => onPaymentMethodChange(e.target.value)}
                        />
                        Google Pay
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="apple_pay"
                          checked={paymentMethod === "apple_pay"}
                          onChange={(e) => onPaymentMethodChange(e.target.value)}
                        />
                        Apple Pay
                      </label>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', flexDirection: 'column' }}
                  onClick={() => onPaymentCategoryChange("credit")}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <input
                      type="radio"
                      id="credit"
                      name="payment_category"
                      value="credit"
                      checked={paymentCategory === "credit"}
                      onChange={(e) => onPaymentCategoryChange(e.target.value)}
                      style={{ marginTop: '0.25rem', flexShrink: 0 }}
                    />
                    <label htmlFor="credit" style={{ margin: 0, cursor: 'pointer' }}>Кредит та оплата частинами</label>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, marginLeft: '1.75rem' }}>
                    Оформлення кредитів у банках партнерів
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Підсумок */}
        {cartItems.length > 0 && (
          <div className="cart-total">
            <p><strong>Всього: {formatPrice(totalPrice)}</strong></p>
            <button 
              className="checkout-btn"
              onClick={onCheckout}
              disabled={savingOrder}
              style={{ opacity: savingOrder ? 0.6 : 1, cursor: savingOrder ? 'not-allowed' : 'pointer' }}
            >
              {savingOrder ? "Оформлення..." : "Оформити замовлення"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}