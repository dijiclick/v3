import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { ArrowLeft, Upload, X, ExternalLink, Save, User, Globe, Twitter, Linkedin, Github, MessageCircle, Building, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBlogAuthorSchema, type BlogAuthor, type InsertBlogAuthor } from "@shared/schema";
import { useBlogAuthor } from "@/lib/content-service";

interface BlogAuthorFormProps {
  authorId?: string;
  onSave?: (author: BlogAuthor) => void;
  onCancel?: () => void;
}

export default function BlogAuthorForm({ authorId, onSave, onCancel }: BlogAuthorFormProps) {
  const [, navigate] = useLocation();
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing author data if editing
  const { data: existingAuthor } = useBlogAuthor(authorId || "");

  const form = useForm<InsertBlogAuthor>({
    resolver: zodResolver(insertBlogAuthorSchema),
    defaultValues: {
      name: "",
      slug: "",
      bio: "",
      email: "",
      avatar: "",
      website: "",
      twitter: "",
      linkedin: "",
      github: "",
      telegram: "",
      jobTitle: "",
      company: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
      featured: false,
      active: true,
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (existingAuthor) {
      form.reset({
        name: existingAuthor.name,
        slug: existingAuthor.slug,
        bio: existingAuthor.bio || "",
        email: existingAuthor.email || "",
        avatar: existingAuthor.avatar || "",
        website: existingAuthor.website || "",
        twitter: existingAuthor.twitter || "",
        linkedin: existingAuthor.linkedin || "",
        github: existingAuthor.github || "",
        telegram: existingAuthor.telegram || "",
        jobTitle: existingAuthor.jobTitle || "",
        company: existingAuthor.company || "",
        seoTitle: existingAuthor.seoTitle || "",
        seoDescription: existingAuthor.seoDescription || "",
        seoKeywords: existingAuthor.seoKeywords || [],
        featured: existingAuthor.featured || false,
        active: existingAuthor.active !== false,
      });
      setSeoKeywords(existingAuthor.seoKeywords || []);
      setAvatarPreview(existingAuthor.avatar || "");
    }
  }, [existingAuthor, form]);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Watch name changes to auto-generate slug
  const watchedName = form.watch("name");
  useEffect(() => {
    if (watchedName && !authorId) {
      const slug = generateSlug(watchedName);
      form.setValue("slug", slug);
    }
  }, [watchedName, form, authorId]);

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/blog/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'x-csrf-token': document.cookie
            .split('; ')
            .find(row => row.startsWith('csrf_token='))
            ?.split('=')[1] || '',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue("avatar", data.url);
      setAvatarPreview(data.url);
      setIsUploading(false);
      toast({
        title: "Success",
        description: "Avatar uploaded successfully!",
      });
    },
    onError: (error: any) => {
      setIsUploading(false);
      toast({
        title: "Error",
        description: `Failed to upload avatar: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InsertBlogAuthor) => {
      const method = authorId ? 'PUT' : 'POST';
      const url = authorId ? `/api/blog/authors/${authorId}` : '/api/blog/authors';
      return apiRequest(method, url, data);
    },
    onSuccess: (savedAuthor) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/authors'] });
      if (authorId) {
        queryClient.invalidateQueries({ queryKey: ['/api/blog/authors', authorId] });
      }
      
      toast({
        title: "Success",
        description: `Author ${authorId ? 'updated' : 'created'} successfully!`,
      });
      
      if (onSave) {
        onSave(savedAuthor);
      } else {
        navigate('/admin/blog/authors');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${authorId ? 'update' : 'create'} author: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setIsUploading(true);
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !seoKeywords.includes(keywordInput.trim())) {
      const newKeywords = [...seoKeywords, keywordInput.trim()];
      setSeoKeywords(newKeywords);
      form.setValue("seoKeywords", newKeywords);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = seoKeywords.filter(k => k !== keyword);
    setSeoKeywords(newKeywords);
    form.setValue("seoKeywords", newKeywords);
  };

  const onSubmit = (data: InsertBlogAuthor) => {
    saveMutation.mutate(data);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/admin/blog/authors');
    }
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleCancel} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold" data-testid="page-title">
          {authorId ? 'Edit Author' : 'Add New Author'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Author's full name" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="author-url-slug" {...field} data-testid="input-slug" />
                        </FormControl>
                        <FormDescription>
                          Used in the author profile URL: /blog/author/{field.value || 'slug'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about this author..."
                            className="min-h-[100px]"
                            dir="rtl"
                            {...field}
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormDescription>
                          Supports Persian/Farsi content with RTL layout
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="author@example.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Developer, Writer, etc." {...field} data-testid="input-job-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Company or organization name" {...field} data-testid="input-company" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Social Media & Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Website
                        </FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} data-testid="input-website" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="@username or full URL" {...field} data-testid="input-twitter" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Profile URL or username" {...field} data-testid="input-linkedin" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            GitHub
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Username or profile URL" {...field} data-testid="input-github" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telegram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Telegram
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="@username or profile URL" {...field} data-testid="input-telegram" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO & Meta Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Custom page title for search engines" {...field} data-testid="input-seo-title" />
                        </FormControl>
                        <FormDescription>
                          Leave empty to use author name as title
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description for search engines (150-160 characters)"
                            rows={3}
                            {...field}
                            data-testid="textarea-seo-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Label htmlFor="seo-keywords">SEO Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        id="seo-keywords"
                        placeholder="Add keyword and press Enter"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        data-testid="input-seo-keywords"
                      />
                      <Button type="button" onClick={handleAddKeyword} data-testid="button-add-keyword">
                        Add
                      </Button>
                    </div>
                    {seoKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {seoKeywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(keyword)}>
                            {keyword}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Avatar Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={avatarPreview} alt="Author avatar" />
                    <AvatarFallback className="text-xl">
                      {form.watch("name") ? getAuthorInitials(form.watch("name")) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button type="button" disabled={isUploading} asChild data-testid="button-upload-avatar">
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? "Uploading..." : "Upload Avatar"}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAvatarPreview("");
                          form.setValue("avatar", "");
                        }}
                        data-testid="button-remove-avatar"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Author Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Author Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            {field.value ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            Active
                          </FormLabel>
                          <FormDescription>
                            Author appears in author directory and can be assigned to posts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Featured
                          </FormLabel>
                          <FormDescription>
                            Featured authors appear prominently in the author directory
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-featured"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Save Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="w-full"
                      data-testid="button-save"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveMutation.isPending 
                        ? "Saving..." 
                        : authorId 
                          ? "Update Author" 
                          : "Create Author"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full"
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}