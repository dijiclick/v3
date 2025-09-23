import { useState } from "react";
import { useSEO } from "@/hooks/use-seo";

export default function ChatGPTPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useSEO({
    title: "ChatGPT Plus - لیمیت پس",
    description: "خرید اکانت ChatGPT با قیمت ویژه از لیمیت پس. دسترسی آسان، هزینه کمتر و مسئولیت کامل در صورت بلاک شدن اکانت",
    keywords: "خرید اکانت ChatGPT، ChatGPT Plus، هوش مصنوعی، لیمیت پس"
  });

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "نحوه اتصال به ابزارها به چه شکلی هست؟",
      answer: "از طریق اکستنشن کروم ما مستقیم به سایت‌ها وصل میشید"
    },
    {
      question: "من سیستمم مک هست آیا میتونم از ابزارها استفاده کنم؟", 
      answer: "بله اکستنشن ما هم روی مک، ویندوز و لینوکس کار میکنه"
    },
    {
      question: "امکان ثبت پروژه در اکانت‌ها وجود داره؟",
      answer: "ما تضمینی نمیدیم که بتونید حتما در همه ابزارها پروژه ایجاد کنید ولی محدودیتی هم اعمال نکردیم"
    },
    {
      question: "در اکانت میدجرنی و چت جی بی تی محدودیت به چه شکل هست؟",
      answer: "در میدجرنی شما محدودیت ۴۰ جنریت تصویر در روز رو دارید ولی در چت جی بی تی فعلا محدودیتی وجود نداره"
    },
    {
      question: "من ۲ پکیج مجزا رو تهیه کردم چجوری همزمان از هر دو استفاده کنم؟",
      answer: "میتونید هر پکیج رو بصورت جداگانه روی یک پروفایل کروم مجزا نصب کنید"
    }
  ];

  const recommendations = [
    { icon: "🎨", name: "Midjourney", price: "۲۹۰ تومان", bg: "bg-purple-500" },
    { icon: "📺", name: "Netflix", price: "۱۲۹ تومان", bg: "bg-red-500" },
    { icon: "🎵", name: "Spotify", price: "۸۹ تومان", bg: "bg-green-500" },
    { icon: "💼", name: "Envato", price: "۱۹۰ تومان", bg: "bg-blue-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-vazir" dir="rtl">
      <main className="max-w-7xl mx-auto px-5 py-10">
        
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 mb-16 bg-white p-10 rounded-3xl shadow-lg">
          <div className="text-right">
            <h1 className="text-5xl font-bold text-gray-800 mb-6" data-testid="chatgpt-page-title">
              ChatGPT Plus
            </h1>
            <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-5xl text-white mx-auto mb-8 lg:hidden">
              🤖
            </div>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              دسترسی به جدیدترین مدل‌های ChatGPT با سرعت بالا، بدون محدودیت و ویژگی‌های حرفه‌ای. تجربه هوش مصنوعی پیشرفته را با لیمیت پس آغاز کنید.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>به جدیدترین نسخه ChatGPT وصل شوید و همیشه یک قدم جلوتر باشید</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>سرعت پاسخ بالاتر</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>دسترسی در ساعات شلوغ</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>ویژگی‌های جدید زودتر</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 font-bold text-lg">✓</span>
                <span>تحلیل تصاویر</span>
              </li>
            </ul>
          </div>
          
          {/* Purchase Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8 hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl flex items-center justify-center text-5xl text-white mx-auto">
                🤖
              </div>
            </div>
            
            {/* Subscription Options */}
            <div className="space-y-3 mb-8">
              <div 
                className={`flex justify-between items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === 'monthly' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => setSelectedPlan('monthly')}
                data-testid="plan-monthly"
              >
                <span className="font-semibold text-gray-800">ماهانه</span>
                <span className="font-bold text-red-500 text-lg">۱۴۹,۰۰۰ تومان</span>
              </div>
              <div 
                className={`flex justify-between items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === '3months' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => setSelectedPlan('3months')}
                data-testid="plan-3months"
              >
                <span className="font-semibold text-gray-800">۳ ماهه</span>
                <span className="font-bold text-red-500 text-lg">۳۹۰,۰۰۰ تومان</span>
              </div>
              <div 
                className={`flex justify-between items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPlan === '6months' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => setSelectedPlan('6months')}
                data-testid="plan-6months"
              >
                <span className="font-semibold text-gray-800">۶ ماهه</span>
                <span className="font-bold text-red-500 text-lg">۷۵۰,۰۰۰ تومان</span>
              </div>
            </div>
            
            {/* Price Summary */}
            <div className="bg-gray-50 p-5 rounded-xl mb-6 text-right">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">قیمت اصلی:</span>
                <span className="text-gray-600">۲۵۰,۰۰۰ تومان</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">تخفیف:</span>
                <span className="text-green-600">-۱۰۱,۰۰۰ تومان</span>
              </div>
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">جمع کل:</span>
                  <span className="text-2xl font-bold text-red-500">
                    {selectedPlan === 'monthly' ? '۱۴۹,۰۰۰' : 
                     selectedPlan === '3months' ? '۳۹۰,۰۰۰' : '۷۵۰,۰۰۰'} تومان
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all hover:-translate-y-1 hover:shadow-lg mb-5"
              data-testid="join-btn"
            >
              شروع آزمایش رایگان
            </button>
            
            <div className="text-center">
              <a href="#" className="text-red-500 text-sm font-medium hover:underline">
                View Details
              </a>
            </div>
          </div>
        </div>

        {/* Screenshots Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1.5fr] gap-10 mb-16" data-testid="screenshots-sidebar-container">
          {/* Screenshots Grid - Takes 2/3 width */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Interface Screenshot */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl" data-testid="screenshot-chat">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">چت هوشمند</div>
                    <div className="text-xs text-gray-500">پاسخ‌های سریع و دقیق</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 text-right">سوال شما اینجا نمایش داده می‌شود</div>
                  <div className="bg-blue-100 p-2 rounded text-xs text-gray-700 text-right">پاسخ هوش مصنوعی در اینجا</div>
                </div>
              </div>
            </div>

            {/* Code Generation Screenshot */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl" data-testid="screenshot-code">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm">{'</>'}</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">تولید کد</div>
                    <div className="text-xs text-gray-500">برنامه‌نویسی هوشمند</div>
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded text-xs">
                  <div className="text-green-400">function hello() &#123;</div>
                  <div className="text-blue-400 ml-4">console.log("سلام");</div>
                  <div className="text-green-400">&#125;</div>
                </div>
              </div>
            </div>

            {/* Image Analysis Screenshot */}
            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-2xl" data-testid="screenshot-image">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm">🖼️</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">تحلیل تصاویر</div>
                    <div className="text-xs text-gray-500">درک محتوای بصری</div>
                  </div>
                </div>
                <div className="bg-gray-200 h-16 rounded mb-2 flex items-center justify-center text-gray-500 text-xs">
                  تصویر شما
                </div>
                <div className="text-xs text-gray-600 text-right">این تصویر نشان‌دهنده ...</div>
              </div>
            </div>

            {/* Writing Assistant Screenshot */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-2xl" data-testid="screenshot-writing">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm">✍️</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">نویسندگی</div>
                    <div className="text-xs text-gray-500">کمک به نگارش</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            {/* Translation Screenshot */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl" data-testid="screenshot-translate">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">🌍</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">ترجمه</div>
                    <div className="text-xs text-gray-500">زبان‌های مختلف</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-2 rounded text-xs text-right">متن فارسی</div>
                  <div className="text-center text-gray-400">⬇️</div>
                  <div className="bg-green-50 p-2 rounded text-xs">English Text</div>
                </div>
              </div>
            </div>

            {/* Math Solver Screenshot */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-2xl" data-testid="screenshot-math">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white text-sm">∑</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">حل ریاضی</div>
                    <div className="text-xs text-gray-500">محاسبات پیشرفته</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-700 mb-2">2x + 5 = 15</div>
                  <div className="text-xs text-blue-600">x = 5</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Takes 1/3 width */}
          <div className="space-y-8">
            
            {/* How It Works */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">چگونه کار می‌کند؟</h3>
              <div className="space-y-4">
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۱
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">انتخاب کنید</h4>
                    <p className="text-xs text-gray-600">از بین بیش از ۳۰۰+ سرویس موجود</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۲
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">پرداخت کنید</h4>
                    <p className="text-xs text-gray-600">به صورت آنلاین و امن</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۳
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">دسترسی به اشتراک</h4>
                    <p className="text-xs text-gray-600">اطلاعات ورود را دریافت کنید</p>
                  </div>
                </div>
                <div className="flex gap-3 text-right">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    ۴
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">از سرویس لذت ببرید</h4>
                    <p className="text-xs text-gray-600">تا پایان مدت اشتراک</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">سوالات متداول</h3>
              <div className="space-y-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                        openFaq === index ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleFaq(index)}
                      data-testid={`faq-question-${index + 1}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          س
                        </div>
                        <h4 className="text-sm font-semibold text-gray-800">{faq.question}</h4>
                      </div>
                      <div className={`w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold transition-transform ${
                        openFaq === index ? 'rotate-45' : ''
                      }`}>
                        +
                      </div>
                    </div>
                    {openFaq === index && (
                      <div className="p-4 bg-white border-t border-gray-200" data-testid={`faq-answer-${index + 1}`}>
                        <p className="text-sm text-gray-600 text-right">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-right">پیشنهاد ما</h3>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((rec, index) => (
                  <a 
                    key={index}
                    href="#"
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all text-decoration-none"
                    data-testid={`recommendation-${index + 1}`}
                  >
                    <div className={`w-9 h-9 ${rec.bg} rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0`}>
                      {rec.icon}
                    </div>
                    <div className="text-right min-w-0">
                      <h5 className="text-xs font-semibold text-gray-800 mb-1 truncate">{rec.name}</h5>
                      <p className="text-xs text-red-500 font-semibold">{rec.price}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-10 rounded-3xl shadow-lg mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">آمار و ارقام</h2>
            <p className="text-red-100 text-lg">اعتماد میلیون‌ها کاربر در سراسر جهان</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center" data-testid="stat-users">
              <div className="text-4xl font-bold mb-2">2500</div>
              <div className="text-red-100">کاربر فعال</div>
            </div>
            <div className="text-center" data-testid="stat-orders">
              <div className="text-4xl font-bold mb-2">10k</div>
              <div className="text-red-100">سفارش موفق</div>
            </div>
            <div className="text-center" data-testid="stat-countries">
              <div className="text-4xl font-bold mb-2">5</div>
              <div className="text-red-100">کشور</div>
            </div>
            <div className="text-center" data-testid="stat-satisfaction">
              <div className="text-4xl font-bold mb-2">۹۸٪</div>
              <div className="text-red-100">رضایت کاربران</div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-6 py-3 rounded-full">
              <span className="text-yellow-300">⭐</span>
              <span className="font-semibold">رتبه ۱ در دسته‌بندی هوش مصنوعی</span>
              <span className="text-yellow-300">⭐</span>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white p-10 rounded-3xl shadow-lg mb-16">
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg mb-3">چرا ChatGPT Plus؟</p>
            <h2 className="text-4xl font-bold text-gray-800 relative inline-block">
              مزایای انتخاب ما
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-red-400 to-red-500 rounded"></div>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">امن و مطمئن</h3>
              <p className="text-gray-600 leading-relaxed">تمام اشتراک‌ها از طریق روش‌های امن تهیه می‌شوند</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">💰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">صرفه‌جویی</h3>
              <p className="text-gray-600 leading-relaxed">با لیمیت‌پس تا ۷۰٪ کمتر پرداخت کنید</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">⚡</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">فوری</h3>
              <p className="text-gray-600 leading-relaxed">در کمتر از ۱۰ دقیقه اشتراک خود را فعال کنید</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl text-center border-2 border-transparent hover:border-red-200 transition-all">
              <div className="text-5xl mb-5">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">با کیفیت</h3>
              <p className="text-gray-600 leading-relaxed">همه اشتراک‌ها کیفیت پریمیوم دارند</p>
            </div>
          </div>
        </div>

        {/* Footer CTA Section */}
        <div className="bg-white p-12 rounded-3xl shadow-lg text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">آماده شروع هستید؟</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              همین حالا به میلیون‌ها کاربری بپیوندید که از قدرت هوش مصنوعی ChatGPT برای تحقق اهدافشان استفاده می‌کنند
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button 
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                data-testid="cta-main-button"
              >
                شروع آزمایش رایگان ۷ روزه
              </button>
              <div className="text-sm text-gray-500">
                بدون نیاز به کارت اعتباری • لغو در هر زمان
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">پشتیبانی ۲۴/۷</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">تضمین بازگشت وجه</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="text-green-500 text-2xl">✓</div>
                <span className="text-gray-700">بروزرسانی‌های رایگان</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}