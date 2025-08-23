// app/addresses/page.tsx
import styles from './Addresses.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'Địa chỉ cửa hàng | TikTok Shop Clone',
  description: 'Thông tin địa chỉ, giờ mở cửa và liên hệ của cửa hàng.',
};

type Branch = {
  name: string;
  address: string;
  phone: string;
  mapUrl: string; // link Google Maps (embed)
  hours?: { days: string; time: string }[];
};

const HQ: Branch = {
  name: 'Cửa hàng A5 – Vĩnh Lộc, Bình Chánh, HCM',
  address: 'A5, Vĩnh Lộc, Bình Chánh, TP.HCM',
  phone: '0968745748',
  mapUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1733.3543485659839!2d106.56195888104364!3d10.810301974819485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b2149d9f17b%3A0xca840e020575c124!2zxJDhuqdtIFbDoXkgQm9keQ!5e0!3m2!1svi!2s!4v1755061367779!5m2!1svi!2s',
  hours: [{ days: 'Thứ 2 – Chủ nhật', time: '08:00 – 23:00' }],
};


// Không còn chi nhánh khác
const BRANCHES: Branch[] = [];

export default function ShopAddressesPage() {
  return (
    <div className={styles.wrap}>
    
      <section className={styles.hero}>
        <div className={styles.breadcrumbs}>
          <Link href="/">Trang chủ</Link>
          <span className={styles.sep}>/</span>
          <span>Địa chỉ</span>
        </div>
        <h1 className={styles.title}>Địa chỉ cửa hàng</h1>
        <p className={styles.subtitle}>
          Mời bạn ghé thăm cửa hàng của chúng tôi hoặc đặt hàng và nhận tại cửa hàng.
        </p>
      </section>

      {/* Store (chỉ 1 địa điểm) */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Cửa hàng</h2>
        <div className={styles.hqGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{HQ.name}</h3>
            <ul className={styles.infoList}>
              <li>📍 {HQ.address}</li>
              <li>📞 {HQ.phone}</li>
              <li>✉️ dambody.vn@gmail.com</li>
            </ul>

            <div className={styles.hours}>
              {(HQ.hours || []).map((h, i) => (
                <div key={i} className={styles.hourRow}>
                  <span>{h.days}</span>
                  <span className={styles.hourTime}>{h.time}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <a
                className={styles.primary}
                href={HQ.mapUrl.replace('output=embed', '')}
                target="_blank"
              >
                🧭 Chỉ đường
              </a>
              <a className={styles.ghost} href={`tel:${HQ.phone.replace(/\s/g, '')}`}>
                📞 Gọi ngay
              </a>
            </div>
          </div>

          <div className={styles.mapCard}>
            <iframe
              className={styles.map}
              src={HQ.mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ cửa hàng"
            />
          </div>
        </div>
      </section>

      {/* Ẩn mục chi nhánh nếu không có */}
      {BRANCHES.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Các chi nhánh</h2>
          <div className={styles.branchGrid}>
            {BRANCHES.map((b, idx) => (
              <div key={idx} className={styles.branchCard}>
                <div className={styles.branchInfo}>
                  <h3 className={styles.cardTitle}>{b.name}</h3>
                  <ul className={styles.infoList}>
                    <li>📍 {b.address}</li>
                    <li>📞 {b.phone}</li>
                  </ul>

                  <div className={styles.hoursCompact}>
                    {(b.hours || []).map((h, i) => (
                      <div key={i} className={styles.hourRow}>
                        <span>{h.days}</span>
                        <span className={styles.hourTime}>{h.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.actionsRow}>
                    <a
                      className={styles.linkBtn}
                      href={b.mapUrl.replace('output=embed', '')}
                      target="_blank"
                    >
                      🧭 Chỉ đường
                    </a>
                    <a className={styles.linkBtn} href={`tel:${b.phone.replace(/\s/g, '')}`}>
                      📞 Gọi
                    </a>
                  </div>
                </div>

                <div className={styles.branchMapWrap}>
                  <iframe
                    className={styles.branchMap}
                    src={b.mapUrl}
                    loading="lazy"
                    title={`Bản đồ - ${b.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ nhỏ */}
      <section className={styles.section}>
        <h2 className={styles.heading}>Đón nhận tại cửa hàng (Pick‑up)</h2>
        <div className={styles.noteCard}>
          <ul>
            <li>Đặt online, chọn “Nhận tại cửa hàng” và đến quầy Pick‑up trình mã đơn.</li>
            <li>Đơn sẽ được giữ trong 48 giờ. Sau thời gian này hệ thống sẽ huỷ tự động.</li>
            <li>Hỗ trợ đổi size trong vòng 7 ngày tại cửa hàng.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
