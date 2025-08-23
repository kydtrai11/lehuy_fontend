'use client';

import Link from 'next/link';
import styles from '@/styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* TOP STRIP */}
      <div className={styles.topStrip}>
        <div className={styles.topLeft}>
          <span className={styles.dot} />
          <p className={styles.slogan}>Đầm Váy Body — Mua sắm thú vị mỗi ngày</p>
        </div>

        <div className={styles.socials}>
          {/* Thay # bằng link thật nếu có */}
          <a aria-label="Facebook" href="#" className={styles.socialBtn} target="_blank" rel="noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.91h-2.32V22c4.78-.78 8.44-4.93 8.44-9.94z"/></svg>
          </a>
          <a aria-label="Instagram" href="#" className={styles.socialBtn} target="_blank" rel="noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.75a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18 6.75z"/></svg>
          </a>
          <a aria-label="TikTok" href="#" className={styles.socialBtn} target="_blank" rel="noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 8.5a7.5 7.5 0 0 1-5-1.85V17a5.5 5.5 0 1 1-5.5-5.5c.34 0 .67.03 1 .1V14a3 3 0 1 0 3 3V2h2a5.5 5.5 0 0 0 4.5 4.5z"/></svg>
          </a>
          <a aria-label="YouTube" href="#" className={styles.socialBtn} target="_blank" rel="noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.02V8.98L15 12z"/></svg>
          </a>
        </div>

 
      </div>

      {/* MIDDLE COLUMNS */}
      <div className={styles.container}>
        <div className={styles.column}>
          <h3>Cửa hàng</h3>
          <ul>
            <li><Link href="/">Trang chủ</Link></li>
            <li><Link href="/about">Giới thiệu</Link></li>
            <li><Link href="/products">Sản phẩm</Link></li>
            <li><Link href="/addresses">Địa chỉ</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3>Hỗ trợ</h3>
          <ul>
            <li><Link href="/policy">Chính sách bảo hành</Link></li>
            <li><Link href="/shipping">Vận chuyển & Đổi trả</Link></li>
            <li><Link href="/faq">Câu hỏi thường gặp</Link></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3>Liên hệ</h3>
          <ul className={styles.contactList}>
            <li>📍 <a href="https://www.google.com/maps?q=Đầm+Váy+Body,+Bình+Chánh,+TP.HCM" target="_blank" rel="noreferrer">A5, Vĩnh Lộc, Bình Chánh, TP.HCM</a></li>
            <li>📞 <a href="tel:0968745748">0968 745 748</a></li>
            <li>📧 <a href="mailto:dambody.vn@gmail.com">dambody.vn@gmail.com</a></li>
            <li>⏰ 08:00 – 23:00 (Thứ 2 – Chủ nhật)</li>
            <li>💬 <a href="https://zalo.me/0968745748" target="_blank" rel="noreferrer">Chat Zalo</a></li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3>Kênh khác</h3>
          <div className={styles.badges}>
            <span className={styles.storeBadge}>Shopee</span>
            <span className={styles.storeBadge}>Lazada</span>
          </div>
          <div className={styles.payments}>
            <span className={styles.payBadge}>VISA</span>
            <span className={styles.payBadge}>Mastercard</span>
            <span className={styles.payBadge}>Momo</span>
            <span className={styles.payBadge}>ZaloPay</span>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className={styles.bottom}>
        <div className={styles.bottomRight}>
          © 2025 Đầm Váy Body. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
