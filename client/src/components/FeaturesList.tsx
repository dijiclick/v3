import { Check, Star, Zap, Shield, Clock, Users, Crown, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  highlighted?: boolean;
  premium?: boolean;
}

interface FeaturesListProps {
  features: string[] | Feature[];
  className?: string;
  layout?: "list" | "grid" | "compact";
  showIcons?: boolean;
  checkmarkColor?: "green" | "red" | "blue";
}

// Mapping for common feature icons
const getFeatureIcon = (title: string) => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('سرعت') || titleLower.includes('فوری') || titleLower.includes('instant')) 
    return <Zap className="h-4 w-4 text-yellow-500" />;
  if (titleLower.includes('پشتیبانی') || titleLower.includes('support')) 
    return <Users className="h-4 w-4 text-blue-500" />;
  if (titleLower.includes('امنیت') || titleLower.includes('secure') || titleLower.includes('ssl')) 
    return <Shield className="h-4 w-4 text-green-500" />;
  if (titleLower.includes('۲۴/۷') || titleLower.includes('24/7') || titleLower.includes('همیشگی')) 
    return <Clock className="h-4 w-4 text-purple-500" />;
  if (titleLower.includes('اختصاصی') || titleLower.includes('خصوصی') || titleLower.includes('premium')) 
    return <Crown className="h-4 w-4 text-yellow-600" />;
  if (titleLower.includes('رایگان') || titleLower.includes('تخفیف') || titleLower.includes('free')) 
    return <Gift className="h-4 w-4 text-red-500" />;
  if (titleLower.includes('ویژه') || titleLower.includes('special') || titleLower.includes('featured')) 
    return <Star className="h-4 w-4 text-orange-500" />;
  
  return null;
};

// Convert string array to Feature objects
const normalizeFeatures = (features: string[] | Feature[]): Feature[] => {
  return features.map((feature, index) => {
    if (typeof feature === 'string') {
      return {
        id: `feature-${index}`,
        title: feature,
        highlighted: false,
        premium: false
      };
    }
    return {
      id: feature.id || `feature-${index}`,
      ...feature
    };
  });
};

export default function FeaturesList({ 
  features, 
  className,
  layout = "list",
  showIcons = true,
  checkmarkColor = "green"
}: FeaturesListProps) {
  const normalizedFeatures = normalizeFeatures(features);

  const getCheckmarkColor = () => {
    switch (checkmarkColor) {
      case "red": return "text-red-500";
      case "blue": return "text-blue-500";
      case "green":
      default: return "text-green-500";
    }
  };

  if (layout === "grid") {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)} dir="rtl">
        {normalizedFeatures.map((feature) => (
          <div
            key={feature.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg transition-colors",
              feature.highlighted ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50",
              feature.premium ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" : ""
            )}
            data-testid={`feature-${feature.id}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Check className={cn("h-5 w-5", getCheckmarkColor())} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {showIcons && getFeatureIcon(feature.title)}
                <h4 className={cn(
                  "font-medium text-sm",
                  feature.premium ? "text-yellow-800" : "text-gray-900"
                )}>
                  {feature.title}
                </h4>
              </div>
              {feature.description && (
                <p className="text-xs text-gray-600 mt-1">
                  {feature.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className={cn("space-y-2", className)} dir="rtl">
        {normalizedFeatures.map((feature) => (
          <div
            key={feature.id}
            className={cn(
              "flex items-center gap-2 text-sm",
              feature.premium ? "text-yellow-700" : "text-gray-700"
            )}
            data-testid={`feature-${feature.id}`}
          >
            <Check className={cn("h-4 w-4 flex-shrink-0", getCheckmarkColor())} />
            {showIcons && getFeatureIcon(feature.title)}
            <span className={cn(
              feature.highlighted ? "font-medium" : "",
              feature.premium ? "font-medium" : ""
            )}>
              {feature.title}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default list layout
  return (
    <div className={cn("space-y-3", className)} dir="rtl">
      {normalizedFeatures.map((feature) => (
        <div
          key={feature.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg transition-colors",
            feature.highlighted ? "bg-blue-50 border border-blue-200" : "",
            feature.premium ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" : ""
          )}
          data-testid={`feature-${feature.id}`}
        >
          <div className="flex-shrink-0 mt-0.5">
            <Check className={cn("h-5 w-5", getCheckmarkColor())} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {showIcons && getFeatureIcon(feature.title)}
              <h4 className={cn(
                "font-medium text-sm",
                feature.premium ? "text-yellow-800" : "text-gray-900",
                feature.highlighted ? "font-bold" : ""
              )}>
                {feature.title}
              </h4>
            </div>
            {feature.description && (
              <p className="text-sm text-gray-600 mt-1">
                {feature.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}