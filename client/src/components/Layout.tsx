import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ShoppingCart from "./ShoppingCart";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>{children}</main>
      <Footer />
      <ShoppingCart />
    </div>
  );
}
