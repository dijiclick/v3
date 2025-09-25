import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Globe, Languages } from 'lucide-react';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export default function AdminLanguageSwitcher() {
  const { language, setLanguage, t, isRTL } = useAdminLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-8 w-8 ${isRTL ? 'ml-2' : 'mr-2'}`}
          data-testid="admin-language-switcher"
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('general.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"}
        className={`min-w-[180px] ${isRTL ? 'text-right' : 'text-left'}`}
      >
        <DropdownMenuItem
          onClick={() => setLanguage('fa')}
          className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${
            language === 'fa' ? 'bg-accent' : ''
          }`}
          data-testid="switch-to-persian"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🇮🇷</span>
            <span className="font-medium">فارسی</span>
          </div>
          {language === 'fa' && (
            <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ${
            language === 'en' ? 'bg-accent' : ''
          }`}
          data-testid="switch-to-english"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🇺🇸</span>
            <span className="font-medium">English</span>
          </div>
          {language === 'en' && (
            <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}