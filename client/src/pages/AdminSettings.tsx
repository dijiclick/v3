import { Settings, Database, Globe, Palette, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isSanityConfigured } from "@/hooks/use-sanity";

export default function AdminSettings() {
  const sanityEnabled = isSanityConfigured();

  const settingsCards = [
    {
      title: "Content Management",
      description: "Configure your content source and CMS settings",
      icon: Database,
      status: sanityEnabled ? "Sanity CMS" : "Database",
      statusVariant: sanityEnabled ? "success" : "info" as const,
      items: [
        `Content Source: ${sanityEnabled ? "Sanity CMS" : "PostgreSQL Database"}`,
        `Auto-sync: ${sanityEnabled ? "Enabled" : "Manual"}`,
        "Content Types: Products, Categories, Pages"
      ]
    },
    {
      title: "Website Settings",
      description: "General website configuration and preferences", 
      icon: Globe,
      status: "Active",
      statusVariant: "success" as const,
      items: [
        "SEO Optimization: Enabled",
        "Open Graph Tags: Configured",
        "Structured Data: Active",
        "Mobile Responsive: Yes"
      ]
    },
    {
      title: "Theme & Appearance",
      description: "Customize the look and feel of your website",
      icon: Palette,
      status: "Default Theme",
      statusVariant: "secondary" as const,
      items: [
        "Color Scheme: Professional Blue",
        "Dark Mode: Supported",
        "Typography: Inter Font Family",
        "Layout: Modern Grid"
      ]
    },
    {
      title: "Security",
      description: "Admin access and security settings",
      icon: Shield,
      status: "Protected",
      statusVariant: "warning" as const,
      items: [
        "Admin Authentication: Password Protected",
        "Session Management: Browser Storage",
        "HTTPS: Enforced",
        "CORS: Configured"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="admin-settings-title">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your website configuration and preferences
        </p>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Settings className="mr-2 h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Current status of your TechShop application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Website Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Database Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ✓
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Admin Panel Active</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${sanityEnabled ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {sanityEnabled ? '✓' : '○'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {sanityEnabled ? 'Sanity CMS Active' : 'Database Mode'}
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
                <Badge variant={card.statusVariant}>
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
                <Button variant="outline" size="sm" data-testid={`configure-${index}`}>
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CMS Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Content Management Integration</CardTitle>
          <CardDescription>
            Current content management setup and options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {sanityEnabled ? "Sanity CMS Integration" : "Database Content Management"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {sanityEnabled 
                    ? "Your content is managed through Sanity CMS with real-time updates"
                    : "Your content is stored in PostgreSQL database with API access"
                  }
                </p>
              </div>
              <Badge variant={sanityEnabled ? "success" : "info"}>
                {sanityEnabled ? "CMS Active" : "Database Mode"}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>
                <strong>Features available:</strong>{" "}
                {sanityEnabled 
                  ? "Rich content editor, Image optimization, Real-time preview, Version control"
                  : "Direct database access, API endpoints, Fast queries, Simple management"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}