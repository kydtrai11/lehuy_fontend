// ✅ FULL UI CategoryManager.tsx (respon đẹp, phân cấp cây, chỉnh sửa + xóa + thêm)

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface Category {
  _id: string;
  name: string;
  parent?: string | { _id: string } | null;
  children?: Category[];
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Record<string, string>>({});

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/categories');
      const flatList: Category[] = res.data;

      const buildTree = (list: Category[], parent: string | null = null): Category[] =>
        list
          .filter((cat) => {
            let catParent: string | null = null;
            if (typeof cat.parent === 'string') catParent = cat.parent;
            else if (typeof cat.parent === 'object' && cat.parent && '_id' in cat.parent)
              catParent = (cat.parent as { _id: string })._id;
            return catParent === parent;
          })
          .map((cat) => ({
            ...cat,
            children: buildTree(list, cat._id),
          }));

      const tree = buildTree(flatList);
      setCategories(tree);

      const autoExpand = new Set<string>();
      const collectExpandable = (nodes: Category[]) => {
        for (const n of nodes) {
          if (n.children && n.children.length > 0) {
            autoExpand.add(n._id);
            collectExpandable(n.children);
          }
        }
      };
      collectExpandable(tree);
      setExpanded(autoExpand);
    } catch (err) {
      console.error('❌ Lỗi khi load danh mục:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!newName.trim()) return alert('Nhập tên danh mục');
    try {
      await axios.post('http://localhost:5001/api/categories', { name: newName, parent: parentId });
      setNewName('');
      setParentId(null);
      fetchCategories();
    } catch (err) {
      alert('Không thể thêm danh mục');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xoá danh mục này?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/categories/${id}`);
      fetchCategories();
    } catch {
      alert('Không thể xoá');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await axios.put(`http://localhost:5001/api/categories/${id}`, { name: editing[id] });
      const copy = { ...editing };
      delete copy[id];
      setEditing(copy);
      fetchCategories();
    } catch {
      alert('Không thể cập nhật');
    }
  };

  const toggleExpand = (id: string) => {
    const copy = new Set(expanded);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setExpanded(copy);
  };

  const renderDropdownOptions = (list: Category[], level = 0): React.ReactNode[] =>
    list.flatMap((c) => [
      <option key={c._id} value={c._id}>
        {'— '.repeat(level) + c.name}
      </option>,
      ...(c.children ? renderDropdownOptions(c.children, level + 1) : []),
    ]);

  const renderTree = (list: Category[], level = 0) =>
    list.map((c) => (
      <div key={c._id} style={{ marginLeft: `${level * 20}px`, marginBottom: '6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', background: '#333',
          padding: '6px 10px', borderRadius: '6px', fontSize: '14px',
        }}>
          {editing[c._id] !== undefined ? (
            <>
              <input
                value={editing[c._id]}
                onChange={(e) => setEditing((prev) => ({ ...prev, [c._id]: e.target.value }))}
                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #888', flex: 1 }}
              />
              <button onClick={() => handleUpdate(c._id)} style={{ color: '#0f0' }}>Lưu</button>
              <button onClick={() => {
                const copy = { ...editing };
                delete copy[c._id];
                setEditing(copy);
              }} style={{ color: '#f55' }}>Huỷ</button>
            </>
          ) : (
            <>
              <span
                onClick={() => c.children?.length && toggleExpand(c._id)}
                style={{ cursor: c.children?.length ? 'pointer' : 'default', flex: 1 }}
              >
                {c.children?.length
                  ? expanded.has(c._id)
                    ? <FaChevronDown style={{ marginRight: 4 }} />
                    : <FaChevronRight style={{ marginRight: 4 }} />
                  : null}{' '
                }{c.name}
              </span>
              <FaEdit onClick={() => setEditing((prev) => ({ ...prev, [c._id]: c.name }))} style={{ cursor: 'pointer', color: '#ffa500' }} />
              <FaTrash onClick={() => handleDelete(c._id)} style={{ cursor: 'pointer', color: '#ff4444' }} />
            </>
          )}
        </div>
        {c.children && c.children.length > 0 && expanded.has(c._id) && (
          <div style={{ marginTop: '4px' }}>{renderTree(c.children, level + 1)}</div>
        )}
      </div>
    ));

  return (
    <div
      style={{
        padding: '20px', background: '#1a1a1a', color: '#fff', borderRadius: '10px', maxWidth: '700px', margin: '0 auto',
      }}
    >
      <h2 style={{ marginBottom: '16px', fontSize: '20px', textAlign: 'center' }}>Quản lý danh mục</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên danh mục mới"
          style={{ padding: '10px', borderRadius: '5px', flex: 1, minWidth: '160px' }}
        />
        <select
          value={parentId || ''}
          onChange={(e) => setParentId(e.target.value || null)}
          style={{ padding: '10px', borderRadius: '5px', minWidth: '160px' }}
        >
          <option value="">Danh mục cha (tuỳ chọn)</option>
          {renderDropdownOptions(categories)}
        </select>
        <button
          onClick={handleAddCategory}
          style={{ padding: '10px 16px', background: '#0f0', color: '#000', borderRadius: '5px', fontWeight: 600 }}
        >
          Thêm
        </button>
      </div>

      <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '5px' }}>
        {renderTree(categories)}
      </div>
    </div>
  );
}