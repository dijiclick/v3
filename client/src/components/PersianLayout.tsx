import PersianHeader from "./PersianHeader";
import PersianFooter from "./PersianFooter";

interface PersianLayoutProps {
  children: React.ReactNode;
}

export default function PersianLayout({ children }: PersianLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PersianHeader />
      <main className="flex-1">
        {children}
      </main>
      <PersianFooter />
    </div>
  );
}