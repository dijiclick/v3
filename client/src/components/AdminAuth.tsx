import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Sparkles,
  Globe
} from "lucide-react";

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  // Try to get translation context, but handle case when it's not available
  let t = (key: string) => key; // fallback function
  let isRTL = false;
  
  try {
    const context = useAdminLanguage();
    t = context.t;
    isRTL = context.isRTL;
  } catch (error) {
    // AdminLanguageContext not available, use fallback values
    console.warn('AdminLanguageContext not available in AdminAuth, using fallback');
  }
  // ===== TEMPORARY BYPASS FOR DEVELOPMENT =====
  // This bypass allows admin access without password when VITE_DISABLE_ADMIN_AUTH=true
  // TODO: Remove this bypass section before production deployment
  const isAuthBypassEnabled = import.meta.env.VITE_DISABLE_ADMIN_AUTH === "true";
  
  if (isAuthBypassEnabled) {
    // Skip all authentication when bypass is enabled
    return <>{children}</>;
  }
  // ===== END TEMPORARY BYPASS =====

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isAuthenticated, isLoading, login } = useAdminAuth();

  // Load remember me preference
  useEffect(() => {
    const remembered = localStorage.getItem('admin-remember-me') === 'true';
    setRememberMe(remembered);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const result = await login(password);
      
      if (result.success) {
        setShowSuccess(true);
        setPassword("");
        // Save remember me preference
        localStorage.setItem('admin-remember-me', rememberMe.toString());
        // Brief success animation before redirect
        setTimeout(() => {
          setShowSuccess(false);
        }, 1500);
      } else {
        setAttemptCount(prev => prev + 1);
        setError(result.error || t('auth.invalid_password'));
        // Shake animation for failed attempts
        setTimeout(() => setError(""), 5000);
      }
    } catch (error) {
      setAttemptCount(prev => prev + 1);
      setError(t('auth.network_error'));
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-600 dark:border-t-blue-400 absolute inset-0"></div>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">{t('auth.verifying')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        
        <Card className={`w-full max-w-md relative backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-0 shadow-2xl ${error && attemptCount > 0 ? 'animate-pulse' : ''} ${showSuccess ? 'scale-105' : ''} transition-all duration-300`}>
          <CardHeader className="text-center pb-8">
            {/* Logo/Brand Section */}
            <div className="mx-auto relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 relative overflow-hidden">
                {showSuccess ? (
                  <CheckCircle2 className="h-10 w-10 text-white animate-scale-in" />
                ) : (
                  <>
                    <Shield className="h-10 w-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse"></div>
                  </>
                )}
              </div>
              {!showSuccess && (
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
              )}
            </div>
            
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Limitpass
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300 mt-2">
              {showSuccess ? (
                <span className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {t('auth.access_granted')}
                </span>
              ) : (
                <>
                  <User className="inline h-4 w-4 mr-2" />
                  {t('auth.secure_portal')}
                </>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!showSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    {t('auth.admin_password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.password_placeholder')}
                      disabled={isSubmitting}
                      className="pr-12 h-12 text-base border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      data-testid="admin-password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={togglePasswordVisibility}
                      disabled={isSubmitting}
                      data-testid="password-visibility-toggle"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isSubmitting}
                    data-testid="remember-me-checkbox"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    {t('auth.remember_me')}
                  </Label>
                </div>
                
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="animate-shake" data-testid="admin-auth-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl"
                  disabled={isSubmitting || !password.trim()}
                  data-testid="admin-login-button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {t('auth.authenticating')}
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      {t('auth.access_panel')}
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="animate-bounce">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  {t('auth.welcome_back')}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('auth.redirecting')}
                </p>
              </div>
            )}

            {/* Security Info */}
            {!showSuccess && (
              <>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>{t('auth.secure_connection')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{t('auth.protected_portal')}</span>
                    </div>
                  </div>
                </div>

                {/* Demo Password Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        {t('auth.demo_access')}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        {t('auth.password_label')} <code className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded font-mono">admin123</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attempt Counter */}
                {attemptCount > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('auth.login_attempts')} {attemptCount}
                      {attemptCount >= 3 && (
                        <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                          {t('auth.verify_password')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}