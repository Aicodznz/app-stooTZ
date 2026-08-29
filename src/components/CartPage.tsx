import React from 'react';
import { useApp } from '../contexts/AppContext';
import { formatPrice } from '../lib/utils';
import { Trash2, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartPage: React.FC<{ onCheckout: () => void }> = ({ onCheckout }) => {
  const { cart, removeFromCart, courses, tests, lectures, lang, user } = useApp();

  const allItems = [...courses, ...tests, ...lectures];
  const cartItems = allItems.filter(item => cart.includes(item.id));
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

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
    <div className="space-y-6 page-anim">
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

      <div className="bg-card border border-theme p-6 rounded-3xl shadow-lg mt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-text3 text-sm font-medium">{lang === 'en' ? 'Subtotal' : 'Jumla ndogo'}</span>
          <span className="font-bold text-lg">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between items-center mb-6 pt-4 border-t border-theme">
          <span className="font-bold">{lang === 'en' ? 'Total' : 'Jumla Kuu'}</span>
          <span className="font-black text-2xl text-primary">{formatPrice(total)}</span>
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
