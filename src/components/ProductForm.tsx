'use client';

import { useEffect, useMemo, useState } from 'react';
import axios, { AxiosError } from 'axios';
import styles from '@/styles/ProductForm.module.css';
import CategoryTreeSelect from '@/components/CategoryTreeSelect'; // dùng selector cây

interface Variant {
  color: string;
  size: string;
  price: number;
  stock: number;
  material?: string;
  description?: string;
  status?: string;
  image?: File | string | null;
}

interface Product {
  _id?: string;
  name: string;
  price: number;
  image: string;
  description: string;
  material: string;
  colors: string;
  sizes: string;
  category: string;
  status: string;
  variants?: Variant[];
  isHot?: boolean;
  isNew?: boolean;
}

interface Props {
  onCreated: () => void;
  editingProduct?: Product | null;
  onUpdated?: () => void;
}

interface Category {
  _id: string;
  name: string;
  parent?: Category | null | string;
}

/* ====== Component ====== */
export default function ProductForm({ onCreated, editingProduct, onUpdated }: Props) {
  const [form, setForm] = useState<Omit<Product, '_id' | 'image' | 'variants'>>({
    name: '',
    price: 0,
    description: '',
    material: '',
    colors: '',
    sizes: '',
    category: '',
    status: 'Còn hàng',
    isHot: false,
    isNew: false,
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catPath, setCatPath] = useState<string>(''); // chỉ để hiển thị breadcrumb danh mục đã chọn
  const [submitting, setSubmitting] = useState(false);

  /* Load category (để giữ tương thích cho chỗ khác nếu có) */
  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => {
        console.error('Lỗi khi tải danh mục:', err);
        alert('Không thể tải danh mục sản phẩm');
      });
  }, []);

  /* Load khi sửa */
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
        material: editingProduct.material,
        colors: editingProduct.colors,
        sizes: editingProduct.sizes,
        category: editingProduct.category,
        status: editingProduct.status,
        isHot: !!editingProduct.isHot,
        isNew: !!editingProduct.isNew,
      });
      setVariants(editingProduct.variants || []);
      setImageFile(null);
    }
  }, [editingProduct]);

  /* ====== Helpers ====== */
  const previewURL = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : ''),
    [imageFile]
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const generateVariants = () => {
    const colors = form.colors.split(',').map((c) => c.trim()).filter(Boolean);
    const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const base = [...variants];

    colors.forEach((color) => {
      sizes.forEach((size) => {
        const exists = base.find((v) => v.color === color && v.size === size);
        if (!exists) base.push({ color, size, price: 0, stock: 0 });
      });
    });

    setVariants(base);
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ====== Submit ====== */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct && !imageFile) return alert('Vui lòng chọn ảnh');

    try {
      setSubmitting(true);
      const formData = new FormData();

      (['name', 'price', 'description', 'material', 'colors', 'sizes', 'category', 'status'] as const).forEach((k) => {
        formData.append(k, String(form[k]));
      });

      formData.append('isHot', String(!!form.isHot));
      formData.append('isNew', String(!!form.isNew));

      if (imageFile) formData.append('main', imageFile);

      formData.append('variants', JSON.stringify(variants));
      variants.forEach((v) => {
        if (v.image instanceof File) formData.append('variantImages', v.image);
      });

      const apiUrl = `/api/products`;
      if (editingProduct) {
        await axios.put(`${apiUrl}/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Cập nhật sản phẩm thành công');
        onUpdated?.();
      } else {
        await axios.post(apiUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('✅ Thêm sản phẩm thành công');
        onCreated();
      }

      // reset
      setForm({
        name: '',
        price: 0,
        description: '',
        material: '',
        colors: '',
        sizes: '',
        category: '',
        status: 'Còn hàng',
        isHot: false,
        isNew: false,
      });
      setImageFile(null);
      setVariants([]);
      setCatPath('');
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      alert(`❌ Lỗi khi lưu sản phẩm: ${err.response?.data?.message || 'Không xác định'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Header */}
      <div className={styles.sectionHeader}>
        <h3>Thông tin sản phẩm</h3>
      </div>

      {/* Grid 2 cột (auto 1 cột trên mobile) */}
      <div className={styles.grid}>
        <div className={styles.field}>
          <label>Tên sản phẩm</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ví dụ: Áo thun oversize…"
            required
          />
        </div>

        <div className={styles.field}>
          <label>Giá (VNĐ)</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="0"
            min={0}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Ảnh đại diện</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {previewURL && (
            <img className={styles.preview} src={previewURL} alt="preview" />
          )}
        </div>

        <div className={styles.field}>
          <label>Chất liệu</label>
          <input
            name="material"
            value={form.material}
            onChange={handleChange}
            placeholder="Cotton, da PU…"
          />
        </div>

        <div className={styles.field}>
          <label>Màu sắc <span className={styles.hint}>(cách nhau bằng dấu phẩy)</span></label>
          <input
            name="colors"
            value={form.colors}
            onChange={handleChange}
            placeholder="Đen, Trắng, Xanh…"
          />
        </div>

        <div className={styles.field}>
          <label>Size <span className={styles.hint}>(cách nhau bằng dấu phẩy)</span></label>
          <input
            name="sizes"
            value={form.sizes}
            onChange={handleChange}
            placeholder="S, M, L, XL…"
          />
        </div>

        <div className={styles.field}>
          <label>Danh mục</label>
          <CategoryTreeSelect
            value={form.category}
            onChange={(id, path) => {
              if (id !== form.category) {
                setForm((p) => ({ ...p, category: id }));
                setCatPath(path);
              }
            }}
          />

          {!!catPath && <div className={styles.catPath}>Đã chọn: {catPath}</div>}
        </div>

        <div className={styles.field}>
          <label>Trạng thái</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>

        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              name="isHot"
              checked={!!form.isHot}
              onChange={handleCheckbox}
            />
            Hiển thị trong “Sản phẩm hot”
          </label>
        </div>

        <div className={styles.checkbox}>
          <label>
            <input
              type="checkbox"
              name="isNew"
              checked={!!form.isNew}
              onChange={handleCheckbox}
            />
            Hiển thị trong “Hàng mới về”
          </label>
        </div>
      </div>

      <div className={styles.fieldFull}>
        <label>Mô tả sản phẩm</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Mô tả ngắn gọn về chất liệu, form dáng, ưu điểm…"
        />
      </div>

      {/* Biến thể */}
      <div className={styles.sectionHeader}>
        <h3>Biến thể (Màu × Size)</h3>
        <button className={styles.ghostBtn} type="button" onClick={generateVariants}>
          🔄 Tạo nhanh từ Màu & Size
        </button>
      </div>

      <div className={styles.variants}>
        {variants.length === 0 && (
          <div className={styles.note}>Chưa có biến thể. Hãy nhập “Màu sắc”, “Size” ở trên và bấm “Tạo nhanh”.</div>
        )}

        {variants.map((v, idx) => (
          <div className={styles.variantRow} key={`variant-${idx}`}>
            <div className={styles.cellSm}>
              <label>Màu</label>
              <input
                value={v.color}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], color: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellSm}>
              <label>Size</label>
              <input
                value={v.size}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], size: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellMd}>
              <label>Giá</label>
              <input
                type="number"
                value={v.price}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], price: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellMd}>
              <label>Kho</label>
              <input
                type="number"
                value={v.stock}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], stock: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Mô tả</label>
              <input
                value={v.description || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], description: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Trạng thái</label>
              <input
                value={v.status || ''}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], status: newValue };
                    return newVariants;
                  });
                }}
              />
            </div>

            <div className={styles.cellLg}>
              <label>Ảnh biến thể</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const newFile = e.target.files?.[0] || null;
                  setVariants((prev) => {
                    const newVariants = [...prev];
                    newVariants[idx] = { ...newVariants[idx], image: newFile };
                    return newVariants;
                  });
                }}
              />
            </div>

            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => removeVariant(idx)}
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {/* Submit sticky */}
      <div className={styles.submitBar}>
        <button className={styles.submitBtn} type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu…' : editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
}