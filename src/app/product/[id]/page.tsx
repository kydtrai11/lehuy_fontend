'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import styles from './page.module.css';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import ReactMarkdown from 'react-markdown';
import { colorMap } from "@/utils/colorMap";


interface Variant {
  color: string;
  size: string;
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
  images?: string[];
  description?: string;
  material?: string;
  colors?: string;
  sizes?: string;
  category: string;
  status?: string;
  variants?: Variant[];
}

interface Category {
  _id: string;
  name: string;
  parent?: string | { _id: string } | null;
}

const api = (p: string) => `/api${p}`;

const normalizeImage = (img?: string): string => {
  const s = (img || '').trim();
  if (!s) return '/placeholder.png';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('/uploads')) return s;
  if (s.startsWith('uploads/')) return `/${s}`;
  if (s.includes('/uploads/')) return s.slice(s.indexOf('/uploads/'));
  return `/uploads/${s}`;
};

export default function ProductDetailPage() {
  const params = useParams() as { id?: string | string[] };
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // state cho biến thể
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [manualImage, setManualImage] = useState<string | null>(null);

  // state cho modal đặt hàng
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  // ✅ state để toggle mô tả
  const [descExpanded, setDescExpanded] = useState(false);

  // sản phẩm liên quan
  const [related, setRelated] = useState<Product[]>([]);
  const { addToCart } = useCart();


  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await axios.get<Product>(api(`/products/${id}`));
        setProduct(res.data);

        if (res.data.category) {
          const catRes = await axios.get<Category>(api(`/categories/${res.data.category}`));
          setCategoryName(catRes.data.name);
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product || !product.category) return;
    const fetchRelated = async () => {
      try {
        const res = await axios.get<Product[]>(api(`/products?category=${product.category}`));
        const filtered = res.data.filter((p) => p._id !== product._id);
        setRelated(filtered.slice(0, 8));
      } catch (err) {
        console.error('Lỗi khi lấy sản phẩm liên quan:', err);
      }
    };
    fetchRelated();
  }, [product]);

  useEffect(() => {
    if (!product) return;
    if (product.variants?.length) {
      const v = product.variants[0];
      setSelectedColor(v.color);
      setSelectedSize(v.size || '');
      return;
    }
    if (product.colors) {
      const firstColor = product.colors.split(',').map((s) => s.trim()).filter(Boolean)[0] || '';
      setSelectedColor(firstColor);
    }
    if (product.sizes) {
      const firstSize = product.sizes.split(',').map((s) => s.trim()).filter(Boolean)[0] || '';
      setSelectedSize(firstSize);
    }
  }, [product]);

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
        .map((v) => v.size.trim())
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
    if (manualImage) return normalizeImage(manualImage);
    if (selectedVariant?.image) return normalizeImage(selectedVariant.image);
    return normalizeImage(product?.images?.[0] || product?.image);
  }, [manualImage, product, selectedVariant]);

  const displayedPrice =
    selectedVariant?.price ?? product?.price ?? (product?.variants?.[0]?.price ?? 0);

  const displayedMaterial = selectedVariant?.material ?? product?.material;
  const displayedDescription =
    (selectedVariant?.description && selectedVariant.description.trim()) || product?.description;

  const displayedStatus = selectedVariant?.status ?? product?.status;
  const displayedStock = selectedVariant?.stock ?? null;

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
      await axios.post(api('/orders'), payload);
      addToCart({
        productId: product._id,
        name: product.name,
        image: displayedImage,
        price: displayedPrice,
        variant: { color: selectedColor, size: selectedSize },
        quantity: qty,
      });
      router.push('/thankyou');
    } catch (err) {
      console.error(err);
      setSubmitMsg('❌ Có lỗi khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className={styles.loading}>Đang tải...</p>;
  if (!product) return <p className={styles.error}>Không tìm thấy sản phẩm.</p>;

  const thumbnails = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <>
      <main className={styles.detailContainer}>
        <div className={styles.galleryBox}>
          <div className={styles.mainImage}>
            <Image
              src={displayedImage}
              alt={product.name}
              width={500}
              height={500}
              className={styles.productImage}
            />
          </div>
          {thumbnails.length > 1 && (
            <div className={styles.thumbnails}>
              {thumbnails.map((img, idx) => (
                <Image
                  key={idx}
                  src={normalizeImage(img)}
                  alt={`${product.name}-${idx}`}
                  width={80}
                  height={80}
                  className={`${styles.thumb} ${displayedImage === normalizeImage(img) ? styles.active : ''
                    }`}
                  onClick={() => setManualImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.infoBox}>
          <h1 className={styles.productName}>{product.name}</h1>

          {/* Màu sắc */}
          {uniqueColors.length > 0 && (
            <div className={styles.variantSection}>

              {/* Màu sắc */}
              {uniqueColors.length > 0 && (
                <div className={styles.variantSection}>
                  <p><strong>Màu sắc:</strong></p>
                  <div className={styles.colorOptions}>
                    {uniqueColors.map((color) => {
                      const colorCode = colorMap[color] || "#ccc"; // fallback nếu không có mapping
                      return (
                        <div
                          key={color}
                          className={`${styles.colorCircleWrapper} ${selectedColor === color ? styles.selectedWrapper : ""
                            }`}
                          onClick={() => {
                            setManualImage(null);
                            setSelectedColor(color);
                          }}
                        >
                          <div
                            className={styles.colorCircle}
                            style={{ backgroundColor: colorCode }}
                          />
                          <span className={styles.colorLabel}>{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}



            </div>
          )}

          {/* Size */}
          {availableSizes.length > 0 && selectedColor && (
            <div className={styles.variantSection}>
              <p><strong>Kích thước:</strong></p>
              <div className={styles.sizeOptions}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''
                      }`}
                    onClick={() => {
                      setManualImage(null);
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className={styles.price}>{displayedPrice.toLocaleString('vi-VN')}₫</p>
          <p className={styles.status}>
            <strong>Trạng thái:</strong> {displayedStatus || 'Đang cập nhật'}
          </p>
          {displayedStock !== null && (
            <p className={styles.stock}><strong>Tồn kho:</strong> {displayedStock}</p>
          )}

          {/* Mô tả */}
          {/* Mô tả */}
          {displayedDescription && (
            <div
              className={`${styles.descriptionBox} ${descExpanded ? styles.descExpanded : styles.descCollapsed
                }`}
            >
              <h4>Mô tả sản phẩm:</h4>
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      src={normalizeImage(props.src || "")}
                      className={styles.descImage}
                      alt="Mô tả sản phẩm"
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p {...props} className={styles.descParagraph} />
                  ),
                }}
              >
                {displayedDescription}
              </ReactMarkdown>

              {/* ✅ Nút toggle nằm bên trong box */}
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
              </button>
            </div>
          )}





          {displayedMaterial && <p><strong>Chất liệu:</strong> {displayedMaterial}</p>}
          {categoryName && <p><strong> Danh mục:</strong> {categoryName}</p>}

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

      {/* Liên quan */}
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

      {/* Modal đặt hàng */}
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
                  {displayedStock !== null && (
                    <p><strong>Tồn kho:</strong> {displayedStock}</p>
                  )}
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
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="orderAddress">Địa chỉ giao hàng *</label>
                  <textarea
                    id="orderAddress"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
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
