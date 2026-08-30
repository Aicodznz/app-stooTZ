import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { formatPrice } from '../lib/utils';
import { Trash2, CreditCard, ShoppingBag, ArrowRight, Tag, CheckCircle2, X } from 'lucide-react';

export const CartPage: React.FC<{ onCheckout: () => void }> = ({ onCheckout }) => {
  const { 
    cart, 
    removeFromCart, 
    courses, 
    tests, 
    lectures, 
    lang, 
    user,
    appliedCoupon,
    applyCouponCode,
    clearAppliedCoupon
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);

  const allItems = [...courses, ...tests, ...lectures];
  const cartItems = allItems.filter(item => cart.includes(item.id));
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Compute discount if coupon applied
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.targetType === 'single_course' && appliedCoupon.targetId) {
      const targetItem = cartItems.find(i => i.id === appliedCoupon.targetId);
      if (targetItem) {
        discountAmount = appliedCoupon.discountType === 'percentage'
          ? Math.round((targetItem.price * appliedCoupon.discountValue) / 100)
          : Math.min(appliedCoupon.discountValue, targetItem.price);
      }
    } else {
      discountAmount = appliedCoupon.discountType === 'percentage'
        ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
        : Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput.trim(), subtotal, cart);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-text3 page-anim">
        <div className="w-20 h-20 bg-card2 border border-theme rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="opacity-20" />
        </div>
        <h2 className="text-xl font-bold mb-2">{lang === 'en' ? 'Your cart is empty' : 'Kikapu chako kiko wazi'}</h2>
        <p className="text-sm max-w-[200px]">{lang === 'en' ? 'Browse our courses and start learning today!' : 'Vinjari kozi zetu na uanze kujifunza leo!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-anim max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{lang === 'en' ? 'Shopping Cart' : 'Kikapu cha Manunuzi'}</h2>
      
      <div className="space-y-3">
        {cartItems.map(item => (
          <div key={item.id} className="bg-card border border-theme p-4 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-bg3 rounded-xl flex items-center justify-center text-2xl">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">{item.title}</h4>
              <p className="text-xs text-primary font-bold">{formatPrice(item.price)}</p>
            </div>
            <button 
              onClick={() => removeFromCart(item.id)}
              className="p-2 text-err hover:bg-err/10 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Coupon Code Section */}
      <div className="bg-card border border-theme p-4 rounded-2xl shadow-xs">
        <label className="text-xs font-bold text-text1 flex items-center gap-1.5 mb-2">
          <Tag size={14} className="text-primary" />
          <span>{lang === 'en' ? 'Have a Discount Code / Coupon?' : 'Una Msimbo wa Punguzo / Kuponi?'}</span>
        </label>

        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <CheckCircle2 size={16} />
              <span>
                Kuponi <strong>{appliedCoupon.code}</strong> imetumika (-{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)})
              </span>
            </div>
            <button
              onClick={() => {
                clearAppliedCoupon();
                setCouponMsg(null);
              }}
              className="p-1 text-text3 hover:text-err rounded-md transition-colors"
              title="Ondoa Kuponi"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Mfano: KARIBU50"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              className="flex-1 h-10 px-3 uppercase font-mono text-xs bg-card2 border border-theme rounded-xl text-text1 outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!couponInput.trim()}
              className="h-10 px-4 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-40"
            >
              {lang === 'en' ? 'Apply' : 'Tumia'}
            </button>
          </form>
        )}

        {couponMsg && (
          <p className={`text-[11px] font-bold mt-2 ${couponMsg.success ? 'text-emerald-500' : 'text-rose-500'}`}>
            {couponMsg.text}
          </p>
        )}
      </div>

      <div className="bg-card border border-theme p-6 rounded-3xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text3 text-xs font-medium">{lang === 'en' ? 'Subtotal' : 'Jumla ndogo'}</span>
          <span className="font-bold text-sm text-text2">{formatPrice(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center mb-2 text-emerald-500 text-xs font-bold">
            <span>{lang === 'en' ? 'Coupon Discount' : 'Punguzo la Kuponi'}</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 pt-3 border-t border-theme">
          <span className="font-bold text-sm text-text1">{lang === 'en' ? 'Total' : 'Jumla Kuu'}</span>
          <span className="font-black text-2xl text-primary">{formatPrice(finalTotal)}</span>
        </div>

        <button 
          onClick={onCheckout}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <CreditCard size={20} />
          <span>{lang === 'en' ? 'Proceed to Payment' : 'Endelea kwenye Malipo'}</span>
          <ArrowRight size={20} />
        </button>
        {!user && (
          <p className="text-[10px] text-center mt-3 text-text3 font-bold uppercase tracking-widest">
            {lang === 'en' ? 'Login required to purchase' : 'Ingia ununue'}
          </p>
        )}
      </div>
    </div>
  );
};
