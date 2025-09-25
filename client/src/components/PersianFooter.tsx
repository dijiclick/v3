import { Link } from "wouter";

export default function PersianFooter() {
  return (
    <div className="font-vazir" dir="rtl">
      {/* Social Media Section */}
      <section className="bg-red-500 py-8">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-center gap-4">
            <a 
              href="#" 
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:-translate-y-1 transition-transform" 
              title="تلگرام"
              data-testid="social-telegram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.65.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:-translate-y-1 transition-transform" 
              title="ایمیل"
              data-testid="social-email"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white hover:-translate-y-1 transition-transform" 
              title="اینستاگرام"
              data-testid="social-instagram"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.71-2.13 1.38-.67.67-1.08 1.34-1.38 2.13-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.71 2.13-1.38.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.71-1.46-1.38-2.13-.67-.67-1.34-1.08-2.13-1.38-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84c-3.4 0-6.16 2.76-6.16 6.16s2.76 6.16 6.16 6.16 6.16-2.76 6.16-6.16-2.76-6.16-6.16-6.16zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.85-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-700 text-white py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-8 text-center">
            {/* درباره لیمیت پس */}
            <div className="footer-section">
              <h4 className="text-base mb-4 text-white font-medium" data-testid="footer-about-title">درباره لیمیت پس</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-contact">تماس با ما</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-faq">سوالات متداول</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-blog">وبلاگ</Link></li>
              </ul>
            </div>

            {/* خدمات */}
            <div className="footer-section">
              <h4 className="text-base mb-4 text-white font-medium" data-testid="footer-services-title">خدمات</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-group-subscription">اشتراک گروهی</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-private-account">درخواست اکانت اختصاصی</Link></li>
                <li><Link href="/seller" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-seller-cooperation">همکاری در فروش</Link></li>
              </ul>
            </div>

            {/* پشتیبانی */}
            <div className="footer-section">
              <h4 className="text-base mb-4 text-white font-medium" data-testid="footer-support-title">پشتیبانی</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-purchase-guide">راهنمای خرید</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white transition-colors leading-relaxed" data-testid="footer-technical-support">پشتیبانی فنی</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-slate-600 pt-5 text-center">
            <p className="text-gray-400 text-xs" data-testid="footer-copyright">
              &copy; ۲۰۲۵ لیمیت پس. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}