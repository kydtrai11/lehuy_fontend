'use client';

import styles from './Contact.module.css';

const CONTACT = {
  phone: '0968745748',
  email: 'dambody.vn@gmail.com',
  address: 'A5, Vĩnh Lộc, Bình Chánh, TP.HCM',
  hours: '08:00 – 23:00 (Thứ 2 – Chủ nhật)',
  zalo: 'https://zalo.me/0968745748',
  mapsOpen: 'https://www.google.com/maps?q=Đầm+Váy+Body,+Bình+Chánh,+TP.HCM',
  mapEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1733.3543485659839!2d106.56195888104364!3d10.810301974819485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b2149d9f17b%3A0xca840e020575c124!2zxJDhuqdtIFbDoXkgQm9keQ!5e0!3m2!1svi!2s!4v1755061367779!5m2!1svi!2s',
};

export default function ContactClient() {
  return (
    <>
      {/* CARDS */}
      <section className={styles.cards}>
        <a className={styles.card} href={`tel:${CONTACT.phone}`}>
          <div className={styles.cardIcon}>📞</div>
          <div>
            <div className={styles.cardTitle}>Hotline</div>
            <div className={styles.cardText}>{CONTACT.phone}</div>
          </div>
        </a>

        <a className={styles.card} href={`mailto:${CONTACT.email}`}>
          <div className={styles.cardIcon}>✉️</div>
          <div>
            <div className={styles.cardTitle}>Email</div>
            <div className={styles.cardText}>{CONTACT.email}</div>
          </div>
        </a>

        <a className={styles.card} href={CONTACT.zalo} target="_blank" rel="noreferrer">
          <div className={styles.cardIcon}>💬</div>
          <div>
            <div className={styles.cardTitle}>Zalo/Chat</div>
            <div className={styles.cardText}>Chat ngay trên Zalo</div>
          </div>
        </a>

        <div className={styles.card}>
          <div className={styles.cardIcon}>📍</div>
          <div>
            <div className={styles.cardTitle}>Địa chỉ</div>
            <div className={styles.cardText}>{CONTACT.address}</div>
          </div>
        </div>
      </section>

      {/* INFO + MAP */}
      <section className={styles.grid}>
        {/* Trái: thông tin + CTA */}
        <div className={styles.form}>
          <h2 className={styles.heading}>Liên hệ trực tiếp</h2>

          <div className={styles.field}>
            <label>Giờ mở cửa</label>
            <div className={styles.cardText}>{CONTACT.hours}</div>
          </div>

          <div className={styles.field}>
            <label>Địa chỉ</label>
            <div className={styles.cardText}>{CONTACT.address}</div>
          </div>

          {/* CTA chính */}
          <div className={styles.actions}>
            <a className={styles.primary} href={CONTACT.mapsOpen} target="_blank" rel="noreferrer">
              🧭 Mở Google Maps
            </a>
          </div>

          {/* 3 nút pill đẹp */}
          <div className={styles.contactActions}>
            <a href={`tel:${CONTACT.phone}`} className={styles.contactBtn}>
              📞 Gọi Hotline
            </a>
            <a href={`mailto:${CONTACT.email}`} className={styles.contactBtn}>
              ✉️ Gửi Email
            </a>
            <a href={CONTACT.zalo} target="_blank" rel="noreferrer" className={styles.contactBtn}>
              💬 Chat Zalo
            </a>
          </div>

          <p className={styles.note}>
            *Để hỗ trợ nhanh nhất, vui lòng gọi/Zalo trong giờ làm việc hoặc mở bản đồ để chỉ đường.
          </p>
        </div>

        {/* Phải: bản đồ */}
        <div className={styles.mapCard}>
          <iframe
            className={styles.map}
            src={CONTACT.mapEmbed}
            loading="lazy"
            title="Bản đồ cửa hàng - Đầm Váy Body"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className={styles.mapInfo}>
            <div>Giờ mở cửa: {CONTACT.hours}</div>
            <a className={styles.link} href={CONTACT.mapsOpen} target="_blank" rel="noreferrer">
              🧭 Mở Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* FAQ (giữ hoặc xoá tuỳ bạn) */}
      <section className={styles.faq}>
        <h2 className={styles.heading}>Câu hỏi thường gặp</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h4>Thời gian phản hồi?</h4>
            <p>Trong giờ làm việc, chúng tôi phản hồi trong 5–15 phút qua Zalo/Hotline.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Đổi trả?</h4>
            <p>Hỗ trợ đổi size/lỗi trong 7–15 ngày (giữ tem mác & hoá đơn).</p>
          </div>
          <div className={styles.faqItem}>
            <h4>Xuất hoá đơn?</h4>
            <p>Có. Vui lòng cung cấp thông tin công ty khi đặt hàng hoặc sau khi mua.</p>
          </div>
        </div>
      </section>
    </>
  );
}
