import { Settings, Database, Globe, Palette, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";

export default function AdminSettings() {
  const { t, isRTL } = useAdminLanguage();
  const { toast } = useToast();

  const handleConfigure = (cardTitle: string) => {
    switch (cardTitle) {
      case t('settings.card.content_management.title'):
        toast({
          title: t('settings.toast.content_management.title'),
          description: t('settings.toast.content_management.desc_database'),
        });
        break;
      case t('settings.card.website.title'):
        toast({
          title: t('settings.toast.website.title'),
          description: t('settings.toast.website.desc'),
        });
        break;
      case t('settings.card.theme.title'):
        toast({
          title: t('settings.toast.theme.title'), 
          description: t('settings.toast.theme.desc'),
        });
        break;
      case t('settings.card.security.title'):
        toast({
          title: t('settings.toast.security.title'),
          description: t('settings.toast.security.desc'),
        });
        break;
      default:
        toast({
          title: cardTitle,
          description: t('settings.toast.coming_soon'),
        });
    }
  };

  const settingsCards = [
    {
      title: t('settings.card.content_management.title'),
      description: t('settings.card.content_management.desc'),
      icon: Database,
      status: t('settings.card.content_management.status.database'),
      statusVariant: "info" as const,
      items: [
        t('settings.card.content_management.item.content_source_db'),
        t('settings.card.content_management.item.auto_sync_manual'),
        t('settings.card.content_management.item.content_types')
      ]
    },
    {
      title: t('settings.card.website.title'),
      description: t('settings.card.website.desc'), 
      icon: Globe,
      status: t('settings.card.website.status'),
      statusVariant: "success" as const,
      items: [
        t('settings.card.website.item.seo'),
        t('settings.card.website.item.opengraph'),
        t('settings.card.website.item.structured_data'),
        t('settings.card.website.item.mobile_responsive')
      ]
    },
    {
      title: t('settings.card.theme.title'),
      description: t('settings.card.theme.desc'),
      icon: Palette,
      status: t('settings.card.theme.status'),
      statusVariant: "secondary" as const,
      items: [
        t('settings.card.theme.item.color_scheme'),
        t('settings.card.theme.item.dark_mode'),
        t('settings.card.theme.item.typography'),
        t('settings.card.theme.item.layout')
      ]
    },
    {
      title: t('settings.card.security.title'),
      description: t('settings.card.security.desc'),
      icon: Shield,
      status: t('settings.card.security.status'),
      statusVariant: "warning" as const,
      items: [
        t('settings.card.security.item.admin_auth'),
        t('settings.card.security.item.session_mgmt'),
        t('settings.card.security.item.https'),
        t('settings.card.security.item.cors')
      ]
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-settings-title">
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {t('settings.desc')}
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Settings className="mr-2 h-5 w-5" />
            {t('settings.system_status')}
          </CardTitle>
          <CardDescription>
            {t('settings.system_status_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('settings.status.website_online')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('settings.status.database_connected')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('settings.status.admin_panel_active')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                ○
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.status.database_mode')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {settingsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 dark:text-white">
                      {card.title}
                    </CardTitle>
                    <CardDescription>
                      {card.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={card.statusVariant as "default" | "destructive" | "outline" | "secondary" | "success" | "warning" | "info"}>
                  {card.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {card.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleConfigure(card.title)}
                  data-testid={`configure-${index}`}
                >
                  {t('settings.configure')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CMS Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">{t('settings.cms_integration')}</CardTitle>
          <CardDescription>
            {t('settings.cms_integration_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('settings.cms.database_management')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('settings.cms.database_desc')}
                </p>
              </div>
              <Badge variant="info">
                {t('settings.cms.status.database_mode')}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                <strong>{t('settings.cms.features_available')}</strong>{" "}
                {t('settings.cms.features_database')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}