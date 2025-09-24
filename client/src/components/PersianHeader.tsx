import { useState } from "react";
import { Link } from "wouter";

export default function PersianHeader() {
  const [currentLang, setCurrentLang] = useState("fa");

  return (
    <header className="bg-red-500 py-3 text-white font-vazir" dir="rtl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5">
        {/* Logo */}
        <div className="text-2xl font-bold text-white" data-testid="logo-persian">
          لیمیت پس
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity" data-testid="link-support">
            صفحه اصلی
          </Link>
          <Link href="/user-guide" className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity" data-testid="link-user-guide">
            نحوه استفاده
          </Link>
          <Link href="/seller" className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity" data-testid="link-seller">
            همکاری در فروش
          </Link>
          <Link href="/support" className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity" data-testid="link-home">
            پشتیبانی
          </Link>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative group">
            <div className="text-sm text-white px-2 py-1 rounded cursor-pointer group-hover:bg-white/10 transition-all" data-testid="button-language">
              {currentLang === "fa" ? "فارسی" : "English"}
            </div>
            <div className="absolute top-full left-0 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform -translate-y-2 group-hover:translate-y-0 transition-all min-w-24 z-50">
              <a 
                href="#" 
                className={`block px-3 py-2 text-sm rounded transition-all m-1 ${
                  currentLang === "fa" ? "bg-red-500 text-white" : "text-gray-700 hover:bg-gray-50 hover:text-red-500"
                }`}
                onClick={(e) => { e.preventDefault(); setCurrentLang("fa"); }}
                data-testid="option-lang-fa"
              >
                فارسی
              </a>
              <a 
                href="#" 
                className={`block px-3 py-2 text-sm rounded transition-all m-1 ${
                  currentLang === "en" ? "bg-red-500 text-white" : "text-gray-700 hover:bg-gray-50 hover:text-red-500"
                }`}
                onClick={(e) => { e.preventDefault(); setCurrentLang("en"); }}
                data-testid="option-lang-en"
              >
                English
              </a>
            </div>
          </div>
          
        </div>
      </nav>
    </header>
  );
}