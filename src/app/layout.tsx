import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuickActionMenu from '@/components/QuickActionMenu';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext'; // ✅ bọc toàn bộ

export const metadata = {
  title: 'Dambody',
  description: 'Website Dambody',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <AuthProvider> {/* ✅ Đảm bảo AuthProvider bọc ngoài CartProvider */}
          <CartProvider>
            <Header />
            <QuickActionMenu />
            <main className="flex-grow">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
