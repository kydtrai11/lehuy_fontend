'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

/* ================== Types ================== */
interface Variant {
  color: string;
  size: string;           // có thể là "M,L,XL" hoặc "XL"
  price: number;
  stock: number;
  material?: string;
  description?: string;
  status?: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  price?: number;
  image: string;
  description?: string;
  material?: string;
  colors?: string;        // "Đỏ,Trắng" (tuỳ bạn có dùng hay không)
  sizes?: string;         // "M,L,XL"
  category: string;       // category id (có thể là con)
  status?: string;
  variants?: Variant[];
}

type CategoryParent = string | { _id: string } | null;

interface Category {
  _id: string;
  name: string;
  parent?: CategoryParent; // có thể là id, object {_id}, hoặc null/undefined
}

/* ================== Helpers (type-safe) ================== */
const isObjWithId = (v: unknown): v is { _id: string } => {
  return (
    typeof v === 'object' &&
    v !== null &&
    '_id' in v &&
    typeof (v as { _id: unknown })._id === 'string'
  );
};

const getParentId = (cat?: Category): string | null => {
  if (!cat) return null;
  const p = cat.parent;
  if (typeof p === 'string') return p;
  if (isObjWithId(p)) return p._id;
  // nếu không có parent -> chính nó là cha
  return cat._id ?? null;
};

const getParentIdFromAny = (p: CategoryParent): string | null => {
  if (typeof p === 'string') return p;
  if (isObjWithId(p)) return p._id;
  return null;
};

/* ================== Component ================== */
export default function ProductDetailPage() {
  const params = useParams() as { id?: string | string[] };
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  // Modal form state
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const [related, setRelated] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const base = process.env.NEXT_PUBLIC_API_URL;

  /* ========== fetch product + category name ========== */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(`${base}/api/products/${id}`);
        setProduct(res.data);

        if (res.data.category) {
          const catRes = await axios.get<Category>(`${base}/api/categories/${res.data.category}`);
          setCategoryName(catRes.data.name);
        } else {
          setCategoryName('');
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, base]);

  /* ========== fetch related (cùng danh mục cha) ========== */
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          axios.get<Category[]>(`${base}/api/categories`),
          axios.get<Product[]>(`${base}/api/products`),
        ]);
        const categories = catsRes.data;
        const allProducts = prodsRes.data;

        const catOfProduct = categories.find((c) => c._id === product.category);
        const parentId = getParentId(catOfProduct);
        if (!parentId) {
          setRelated([]);
          return;
        }

        // tất cả danh mục thuộc cùng cha (bao gồm chính cha)
        const underSameParentIds = categories
          .filter((c) => c._id === parentId || getParentIdFromAny(c.parent ?? null) === parentId)
          .map((c) => c._id);

        // lọc sản phẩm thuộc các danh mục trên, loại chính nó
        const rel = allProducts
          .filter((p) => p._id !== product._id && underSameParentIds.includes(p.category))
          .slice(0, 8);

        setRelated(rel);
      } catch (e) {
        console.error('Lỗi khi lấy sản phẩm liên quan:', e);
        setRelated([]);
      }
    };

    fetchRelated();
  }, [product, base]);

  /* ========== derived states ========== */
  const uniqueColors = useMemo(() => {
    if (!product) return [];
    if (product.colors) return product.colors.split(',').map((c) => c.trim()).filter(Boolean);
    const set = new Set<string>((product.variants ?? []).map((v) => v.color).filter(Boolean));
    return Array.from(set);
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    const hasColor = (product.variants ?? []).some((v) => v.color === selectedColor);
    if (hasColor) {
      const sizes = (product.variants ?? [])
        .filter((v) => v.color === selectedColor)
        .flatMap((v) => v.size.split(',').map((s) => s.trim()))
        .filter(Boolean);
      return Array.from(new Set(sizes));
    }
    if (product.sizes) return product.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    return (product?.variants ?? []).find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  const displayedImage = useMemo(() => {
    if (selectedVariant?.image) return `${base}${selectedVariant.image}`;
    if (product?.image?.startsWith('http')) return product.image;
    return product?.image ? `${base}${product.image}` : '/placeholder.png';
  }, [product, selectedVariant, base]);

  const displayedPrice =
    selectedVariant?.price ?? product?.price ?? (product?.variants?.[0]?.price ?? 0);

  const displayedMaterial = selectedVariant?.material ?? product?.material;
  const displayedDescription = selectedVariant?.description ?? product?.description;
  const displayedStatus = selectedVariant?.status ?? product?.status;

  /* ========== actions ========== */
  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize) return;

    addToCart({
      productId: product._id,
      name: product.name,
      image: displayedImage,
      price: displayedPrice,
      variant: { color: selectedColor, size: selectedSize },
      quantity: 1,
    });
    alert('✅ Đã thêm vào giỏ hàng!');
  };

  const handleOrderNow = () => {
    if (!product || !selectedColor || !selectedSize) {
      alert('Vui lòng chọn màu và kích cỡ trước khi đặt hàng.');
      return;
    }
    setIsOrderOpen(true);
    setQty(1);
    setSubmitMsg(null);
  };

  const validatePhoneVN = (phone: string) => /^(0|\+?84)\d{8,10}$/.test(phone.replace(/\s+/g, ''));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!orderName.trim() || !validatePhoneVN(orderPhone) || !orderAddress.trim()) {
      setSubmitMsg('⚠️ Vui lòng nhập Họ tên, SĐT hợp lệ và Địa chỉ giao hàng.');
      return;
    }
    if (qty < 1) {
      setSubmitMsg('⚠️ Số lượng phải ≥ 1.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMsg(null);

      const payload = {
        productId: product._id,
        name: product.name,
        image: displayedImage,
        categoryName,
        price: displayedPrice,
        variant: { color: selectedColor, size: selectedSize },
        quantity: qty,
        customer: {
          fullName: orderName.trim(),
          phone: orderPhone.trim(),
          address: orderAddress.trim(),
          note: orderNote.trim(),
        },
        source: 'product-detail',
      };

      await axios.post(`${base}/api/orders`, payload);

      // (tuỳ bạn) thêm vào giỏ để đồng bộ trải nghiệm, có thể giữ hoặc bỏ
      addToCart({
        productId: product._id,
        name: product.name,
        image: displayedImage,
        price: displayedPrice,
        variant: { color: selectedColor, size: selectedSize },
        quantity: qty,
      });

      // Chuyển hướng ngay sang trang cảm ơn
      router.push('/thankyou');
      // Không setSubmitMsg / không đóng modal bằng setTimeout để tránh nhấp nháy UI
    } catch (err) {
      console.error(err);
      setSubmitMsg('❌ Có lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ========== render ========== */
  if (loading) return <p className={styles.loading}>Đang tải...</p>;
  if (!product) return <p className={styles.error}>Không tìm thấy sản phẩm.</p>;

  return (
    <>
      <main className={styles.detailContainer}>
        <div className={styles.imageBox}>
          <Image
            src={displayedImage}
            alt={product.name}
            width={500}
            height={500}
            className={styles.productImage}
          />
        </div>

        <div className={styles.infoBox}>
          <h1 className={styles.productName}>{product.name}</h1>

          {uniqueColors.length > 0 && (
            <div className={styles.variantSection}>
              <p><strong>Màu sắc:</strong></p>
              <div className={styles.colorOptions}>
                {uniqueColors.map((color) => (
                  <div
                    key={color}
                    className={`${styles.colorCircleWrapper} ${selectedColor === color ? styles.selectedWrapper : ''}`}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize('');
                    }}
                  >
                    <div className={styles.colorCircle} style={{ backgroundColor: color }} />
                    <span className={styles.colorLabel}>{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && selectedColor && (
            <div className={styles.variantSection}>
              <p><strong>Kích thước:</strong></p>
              <div className={styles.sizeOptions}>
                {availableSizes.map((size) => (
                  <div
                    key={size}
                    className={`${styles.sizeButton} ${selectedSize === size ? styles.selectedSize : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className={styles.price}>{displayedPrice.toLocaleString('vi-VN')}₫</p>
          <p className={styles.status}>
            <strong>Trạng thái:</strong> {displayedStatus || 'Đang cập nhật'}
          </p>

          <div className={styles.meta}>
            {displayedDescription && <p><strong>Mô tả:</strong> {displayedDescription}</p>}
            {displayedMaterial && <p><strong>Chất liệu:</strong> {displayedMaterial}</p>}
            {categoryName && <p><strong>📂 Danh mục:</strong> {categoryName}</p>}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.buyBtn}
              onClick={handleAddToCart}
              disabled={!selectedColor || !selectedSize}
            >
              🛒 Thêm vào giỏ hàng
            </button>

            <button
              className={styles.orderBtn}
              onClick={handleOrderNow}
              disabled={!selectedColor || !selectedSize}
            >
              🧾 Đặt hàng ngay
            </button>

            <a href="tel:0123456789" className={styles.contactBtn}>📞 Liên hệ tư vấn</a>
          </div>
        </div>
      </main>

      {/* ===== SẢN PHẨM LIÊN QUAN ===== */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Sản phẩm liên quan</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ===== MODAL ĐẶT HÀNG ===== */}
      {isOrderOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Đặt hàng nhanh</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOrderOpen(false)}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.summary}>
                <Image
                  src={displayedImage}
                  alt={product.name}
                  width={90}
                  height={90}
                  className={styles.summaryImg}
                />
                <div className={styles.summaryInfo}>
                  <p className={styles.summaryName}>{product.name}</p>
                  <p>Biến thể: <strong>{selectedColor}</strong> / <strong>{selectedSize}</strong></p>
                  <p className={styles.summaryPrice}>{displayedPrice.toLocaleString('vi-VN')}₫</p>
                </div>
              </div>

              <form onSubmit={handleSubmitOrder} className={styles.orderForm}>
                <div className={styles.formRow}>
                  <label htmlFor="orderName">Họ tên *</label>
                  <input
                    id="orderName"
                    type="text"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="orderPhone">Số điện thoại *</label>
                  <input
                    id="orderPhone"
                    type="tel"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    placeholder="090xxxxxxx"
                    required
                  />
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="orderAddress">Địa chỉ giao hàng *</label>
                  <textarea
                    id="orderAddress"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    rows={3}
                    required
                  />
                </div>

                <div className={styles.formRowInline}>
                  <label htmlFor="qty">Số lượng</label>
                  <div className={styles.qtyBox}>
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                    <input
                      id="qty"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                    />
                    <button type="button" onClick={() => setQty((q) => q + 1)}>+</button>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label htmlFor="orderNote">Ghi chú</label>
                  <textarea
                    id="orderNote"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Yêu cầu giao hàng, xuất hoá đơn,..."
                    rows={2}
                  />
                </div>

                {submitMsg && <p className={styles.submitMsg}>{submitMsg}</p>}

                <button className={styles.submitBtn} type="submit" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Xác nhận đặt hàng'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
