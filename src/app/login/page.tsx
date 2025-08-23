'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import styles from '@/styles/LoginPage.module.css';
import { useAuth } from '@/context/AuthContext';

interface LoginErrorResponse {
  message?: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || '',
    []
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Gửi yêu cầu đăng nhập tới backend
      await axios.post(
        `${API_BASE}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      // 2. Gọi /me để lấy thông tin user từ cookie
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        withCredentials: true,
      });

      setUser(res.data.user);

      // 3. Điều hướng
      const next = (searchParams?.get('next') as string | null) ?? '/admin';
      router.push(next);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<LoginErrorResponse>;
        setError(
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Đăng nhập thất bại!'
        );
      } else {
        setError('Đã có lỗi xảy ra!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>

        {error && <p className={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
