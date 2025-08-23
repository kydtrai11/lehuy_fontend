'use client';

import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
  const { cart, removeFromCart, updateCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Modal đặt hàng
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSelect = (index: number) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleQuantityChange = (index: number, change: number) => {
    const item = cart[index];
    const newQty = (item.quantity || 1) + change;
    if (newQty <= 0) return;
    const updated = [...cart];
    updated[index].quantity = newQty;
    localStorage.setItem('cart', JSON.stringify(updated));
    updateCart?.(updated);
  };

  const totalPrice = selectedItems.reduce(
    (sum, i) => sum + cart[i].price * (cart[i].quantity || 1),
    0
  );

  const validatePhoneVN = (phone: string) =>
    /^(0|\+?84)\d{8,10}$/.test(phone.replace(/\s+/g, ''));

  const openOrderModal = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }
    setIsOrderOpen(true);
    setSubmitMsg(null);
  };

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim() || !validatePhoneVN(orderPhone) || !orderAddress.trim()) {
      setSubmitMsg('⚠️ Nhập đầy đủ Họ tên, SĐT hợp lệ và Địa chỉ.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMsg(null);

      // gửi từng sản phẩm giống ProductDetail
      const reqs = selectedItems.map((idx) => {
        const it = cart[idx];
        const payload = {
          productId: it.productId,
          name: it.name,
          image: it.image,
          categoryName: '',
          price: it.price,
          variant: { color: it.variant?.color, size: it.variant?.size },
          quantity: it.quantity || 1,
          customer: {
            fullName: orderName.trim(),
            phone: orderPhone.trim(),
            address: orderAddress.trim(),
            note: orderNote.trim(),
          },
          source: 'cart',
        };
        return axios.post(`${API}/api/orders`, payload);
      });

      await Promise.all(reqs);

      // Xoá sp đã đặt
      const remain = cart.filter((_, idx) => !selectedItems.includes(idx));
      localStorage.setItem('cart', JSON.stringify(remain));
      updateCart?.(remain);
      setSelectedItems([]);

      // Redirect sang trang cảm ơn
      router.push('/thankyou');
    } catch (err) {
      console.error(err);
      setSubmitMsg('❌ Lỗi khi đặt hàng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>🛒 Giỏ hàng của bạn</h1>

      {!isClient ? (
        <p className={styles.empty}>Đang tải...</p>
      ) : cart.length === 0 ? (
        <p className={styles.empty}>Không có sản phẩm nào.</p>
      ) : (
        <>
          <ul className={styles.list}>
            {cart.map((item, index) => (
              <li key={index} className={styles.item}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(index)}
                  onChange={() => handleSelect(index)}
                />
                <Image src={item.image} alt={item.name} width={100} height={100} className={styles.image} />
                <div className={styles.info}>
                  <h3>{item.name}</h3>
                  <p>{item.variant?.color} / {item.variant?.size}</p>
                  <p className={styles.price}>
                    {(item.price * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                  </p>
                </div>

                {/* nút + - */}
                <div className={styles.qtyBox}>
                  <button onClick={() => handleQuantityChange(index, -1)}>−</button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                </div>

                <button onClick={() => removeFromCart(index)} className={styles.removeBtn}>
                  ❌
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.footer}>
            <p>Tổng: <strong>{totalPrice.toLocaleString('vi-VN')}₫</strong></p>
            <button onClick={openOrderModal} className={styles.orderBtn}>Đặt hàng</button>
          </div>
        </>
      )}

      {/* Modal đặt hàng */}
      {isOrderOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Đặt hàng ({selectedItems.length} sản phẩm)</h3>
              <button className={styles.closeBtn} onClick={() => setIsOrderOpen(false)}>×</button>
            </div>

            <form onSubmit={submitOrder} className={styles.orderForm}>
              <div className={styles.formRow}>
                <label>Họ tên *</label>
                <input value={orderName} onChange={(e) => setOrderName(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label>Số điện thoại *</label>
                <input value={orderPhone} onChange={(e) => setOrderPhone(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label>Địa chỉ *</label>
                <textarea value={orderAddress} onChange={(e) => setOrderAddress(e.target.value)} required />
              </div>
              <div className={styles.formRow}>
                <label>Ghi chú</label>
                <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />
              </div>

              {submitMsg && <p className={styles.submitMsg}>{submitMsg}</p>}
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Xác nhận đặt hàng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}