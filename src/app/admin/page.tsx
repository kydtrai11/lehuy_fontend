'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import ProductForm from '@/components/ProductForm';
import ProductCard from '@/components/ProductCard';
import CategoryManager from '@/components/CategoryManager';

// ✅ Khai báo type rõ ràng cho biến thể
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

export interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  material: string;
  colors: string;
  sizes: string;
  category: string;
  status: string;
  variants?: Variant[]; // ✅ Đã fix any
}

interface Category {
  _id: string;
  name: string;
  parent: string | null;
  children: Category[];
}

const getFlatCategories = (cats: Category[]): Category[] => {
  let result: Category[] = [];
  for (const cat of cats) {
    result.push(cat);
    if (cat.children?.length) {
      result = result.concat(getFlatCategories(cat.children));
    }
  }
  return result;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const selectedCategory = useMemo(() => {
    return selectedCategoryId
      ? getFlatCategories(categories).find(c => c._id === selectedCategoryId)
      : null;
  }, [selectedCategoryId, categories]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Lỗi khi load sản phẩm:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      const buildTree = (list: Category[], parent: string | null = null): Category[] => {
        return list
          .filter(c => (parent === null ? !c.parent : c.parent === parent))
          .map(c => ({
            ...c,
            children: buildTree(list, c._id),
          }));
      };
      setCategories(buildTree(res.data));
    } catch (err) {
      console.error('Lỗi khi load danh mục:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Lỗi khi xoá sản phẩm:', err);
    }
  };

  const handleProductCreated = () => {
    fetchProducts();
  };

  const handleProductUpdated = () => {
    fetchProducts();
    setEditingProduct(null);
  };

  const getAllCategoryIds = (category: Category): string[] => {
    let ids = [category._id];
    for (const child of category.children || []) {
      ids = ids.concat(getAllCategoryIds(child));
    }
    return ids;
  };

  const getProductsOfCategory = (categoryId: string): Product[] => {
    const flatCats = getFlatCategories(categories);
    const category = flatCats.find(c => c._id === categoryId);
    if (!category) return [];

    const allIds = getAllCategoryIds(category);
    return products.filter(p => allIds.includes(p.category));
  };

  const groupedProducts = useMemo(() => {
    const groupedResult: Record<string, Product[]> = {};

    if (!selectedCategory) {
      const parentCategories = categories.filter(c => !c.parent);
      parentCategories.forEach(category => {
        const categoryProducts = getProductsOfCategory(category._id);
        if (categoryProducts.length > 0) {
          groupedResult[category._id] = categoryProducts;
        }
      });

      const uncategorizedProducts = products.filter(p => !p.category);
      if (uncategorizedProducts.length > 0) {
        groupedResult['uncategorized'] = uncategorizedProducts;
      }
    } else {
      const categoryProducts = getProductsOfCategory(selectedCategory._id);
      if (categoryProducts.length > 0) {
        groupedResult[selectedCategory._id] = categoryProducts;
      }
    }

    return groupedResult;
  }, [products, categories, selectedCategory, getProductsOfCategory]);

  const getCategoryName = (id: string) => {
    const flat = getFlatCategories(categories);
    const category = flat.find(c => c._id === id);
    return category ? category.name : 'Không rõ';
  };

  useEffect(() => {
    if (editingProduct) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [editingProduct]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: '#111' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#fff', textAlign: 'center' }}>
        Quản lý sản phẩm
      </h2>

      <CategoryManager />
      <ProductForm
        onCreated={handleProductCreated}
        editingProduct={editingProduct}
        onUpdated={handleProductUpdated}
      />

      {/* Bộ lọc danh mục */}
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        marginTop: '2rem',
        marginBottom: '2rem',
        borderRadius: '10px'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Lọc Theo Danh Mục</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => setSelectedCategoryId(null)}
            style={{
              padding: '8px 16px',
              background: !selectedCategory ? '#00cc00' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Tất cả sản phẩm
          </button>

          {categories.map(cat => (
            <div key={cat._id}>
              <button
                onClick={() => setSelectedCategoryId(cat._id)}
                style={{
                  padding: '8px 16px',
                  background: selectedCategoryId === cat._id ? '#00cc00' : '#333',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginBottom: cat.children?.length ? '8px' : 0
                }}
              >
                {cat.name}
              </button>

              {cat.children && (
                <div style={{
                  marginLeft: '20px',
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {cat.children.map(child => (
                    <button
                      key={child._id}
                      onClick={() => setSelectedCategoryId(child._id)}
                      style={{
                        padding: '6px 12px',
                        background: selectedCategoryId === child._id ? '#00cc00' : '#222',
                        color: '#ccc',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9em'
                      }}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị sản phẩm */}
      {Object.entries(groupedProducts).map(([categoryId, items]) => (
        <div key={categoryId} style={{ marginBottom: '3rem' }}>
          <h3 style={{ color: '#fff', margin: '20px 0' }}>{getCategoryName(categoryId)}</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
            padding: '20px',
            background: '#1a1a1a',
            borderRadius: '10px'
          }}>
            {items.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                admin
                categories={categories}
                onDelete={() => handleDelete(p._id)}
                onEdit={() => setEditingProduct(p)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}