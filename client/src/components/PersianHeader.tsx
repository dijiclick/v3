import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Page } from "@shared/schema";

export default function PersianHeader() {
  const [currentLang, setCurrentLang] = useState("fa");

  // Fetch navigation pages from API
  const { data: pages = [] } = useQuery<Page[]>({
    queryKey: ['/api/pages'],
  });

  // Filter and sort pages for navigation
  const navigationPages = pages
    .filter(page => page.status === 'published' && page.showInNavigation)
    .sort((a, b) => (a.navigationOrder || 0) - (b.navigationOrder || 0));

  return (
    <header className="bg-red-500 py-3 text-white font-vazir" dir="rtl">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-5">
        {/* Logo */}
        <div className="text-2xl font-bold text-white" data-testid="logo-persian">
          لیمیت پس
        </div>
        
        {/* Dynamic Navigation Links */}
        <div className="flex items-center gap-8">
          {navigationPages.map((page) => (
            <Link 
              key={page.id}
              href={page.slug === 'home' ? '/' : `/${page.slug}`}
              className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity" 
              data-testid={`link-${page.slug}`}
            >
              {page.title}
            </Link>
          ))}
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