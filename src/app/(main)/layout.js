// app/(main)/layout.js
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
