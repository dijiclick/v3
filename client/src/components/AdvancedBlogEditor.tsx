import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  AlertCircle, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff, 
  Save, 
  FileText, 
  Clock,
  Palette,
  Type,
  AlignRight,
  AlignLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedBlogEditorProps {
  value: string | object | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onAutoSave?: (content: string) => void;
  autoSaveInterval?: number; // milliseconds
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for blog images
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"];

// Persian/Farsi text detection helper
const detectPersianText = (text: string): boolean => {
  const persianRegex = /[\u0600-\u06FF\u200C\u200D]/;
  return persianRegex.test(text);
};

// Word and character counting utility
const getTextStats = (html: string) => {
  // Remove HTML tags and get plain text
  const plainText = html.replace(/<[^>]*>/g, '').trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  const characters = plainText.length;
  const charactersNoSpaces = plainText.replace(/\s/g, '').length;
  const readingTime = Math.ceil(words / 200); // Approximate reading time (200 WPM)
  
  return { words, characters, charactersNoSpaces, readingTime };
};

export function AdvancedBlogEditor({ 
  value, 
  onChange, 
  placeholder = "شروع به نوشتن کنید...", 
  className,
  onAutoSave,
  autoSaveInterval = 30000 // 30 seconds
}: AdvancedBlogEditorProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isRTL, setIsRTL] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [textStats, setTextStats] = useState({ words: 0, characters: 0, charactersNoSpaces: 0, readingTime: 0 });
  
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Convert value to string for ReactQuill
  const htmlValue = useMemo(() => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // Handle JSON content - convert to HTML or use as-is
      return JSON.stringify(value);
    }
    return '';
  }, [value]);

  // Update text statistics when content changes
  useEffect(() => {
    const stats = getTextStats(htmlValue);
    setTextStats(stats);
  }, [htmlValue]);

  // Auto-save functionality
  useEffect(() => {
    if (onAutoSave && htmlValue) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer
      autoSaveTimerRef.current = setTimeout(() => {
        onAutoSave(htmlValue);
        setLastSaved(new Date());
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [htmlValue, onAutoSave, autoSaveInterval]);

  // Detect text direction based on content
  useEffect(() => {
    if (htmlValue) {
      const plainText = htmlValue.replace(/<[^>]*>/g, '');
      setIsRTL(detectPersianText(plainText));
    }
  }, [htmlValue]);

  // Custom image upload handler for blog-specific endpoint
  const imageHandler = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "نوع فایل نامعتبر",
        description: "لطفاً فایل PNG، JPG، JPEG، WebP یا GIF انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "فایل خیلی بزرگ است",
        description: "لطفاً تصویری کمتر از ۱۰ مگابایت انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 10;
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/admin/blog/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "آپلود ناموفق بود");
      }

      const data = await response.json();
      
      // Insert image into editor
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection();
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, "image", data.url);
        quill.setSelection(index + 1, 0);
      }

      toast({
        title: "تصویر آپلود شد",
        description: "تصویر با موفقیت به محتوای شما اضافه شد.",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "آپلود ناموفق",
        description: error instanceof Error ? error.message : "آپلود تصویر ناموفق بود",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(null);
      }, 1000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [toast]);

  // Enhanced toolbar configuration with Persian support
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ direction: "rtl" }], // RTL support
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          ["blockquote", "code-block"],
          ["link", "image"],
          [{ script: "sub" }, { script: "super" }],
          ["clean"], // Remove formatting
        ],
        handlers: {
          image: imageHandler,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  // Editor formats
  const formats = [
    "header", "bold", "italic", "underline", "strike",
    "color", "background", "align", "direction",
    "list", "bullet", "indent", "blockquote", "code-block",
    "link", "image", "script"
  ];

  // Handle manual save
  const handleManualSave = useCallback(() => {
    if (onAutoSave && htmlValue) {
      onAutoSave(htmlValue);
      setLastSaved(new Date());
      toast({
        title: "ذخیره شد",
        description: "محتوای شما با موفقیت ذخیره شد.",
      });
    }
  }, [htmlValue, onAutoSave, toast]);

  // Drag and drop functionality
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ALLOWED_IMAGE_TYPES.includes(file.type));
    
    if (imageFile) {
      // Create a proper file input change event
      const fileInput = fileInputRef.current;
      if (fileInput) {
        // Create a new FileList-like object
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(imageFile);
        fileInput.files = dataTransfer.files;
        
        // Create a proper change event
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: fileInput
        });
        
        handleFileChange(event as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className={cn("advanced-blog-editor", className, isFullscreen && "fixed inset-0 z-50 bg-white dark:bg-gray-900")}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
        data-testid="blog-image-upload-input"
      />
      
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            ویرایشگر پیشرفته وبلاگ
          </h3>
          
          {/* Text Statistics */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {textStats.words} کلمه
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Type className="h-3 w-3" />
              {textStats.characters} کاراکتر
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {textStats.readingTime} دقیقه مطالعه
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save status */}
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              آخرین ذخیره: {lastSaved.toLocaleTimeString('fa-IR')}
            </span>
          )}

          {/* Manual save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={!htmlValue}
            data-testid="manual-save-button"
          >
            <Save className="h-4 w-4 mr-2" />
            ذخیره
          </Button>

          {/* Text direction toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRTL(!isRTL)}
            data-testid="direction-toggle"
          >
            {isRTL ? <AlignRight className="h-4 w-4" /> : <AlignLeft className="h-4 w-4" />}
          </Button>

          {/* Preview toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            data-testid="preview-toggle"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="fullscreen-toggle"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Upload progress indicator */}
      {uploadProgress !== null && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b p-3">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">
                  {isUploading ? "در حال آپلود تصویر..." : "آپلود کامل شد!"}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Content */}
      <div className={cn("flex", isFullscreen ? "h-[calc(100vh-120px)]" : "min-h-[500px]")}>
        {/* Editor Panel */}
        <div className={cn("flex-1", showPreview && "w-1/2 border-r")}>
          <div
            className="h-full"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            data-testid="editor-drop-zone"
          >
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={htmlValue}
              onChange={onChange}
              placeholder={placeholder}
              modules={modules}
              formats={formats}
              className="h-full"
              style={{
                height: isFullscreen ? "calc(100vh - 200px)" : "500px",
                direction: isRTL ? "rtl" : "ltr",
              }}
              data-testid="advanced-blog-editor"
            />
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div className="max-w-none">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">پیش‌نمایش</h4>
              <div
                className={cn(
                  "prose prose-lg max-w-none",
                  "prose-headings:text-gray-900 dark:prose-headings:text-white",
                  "prose-p:text-gray-700 dark:prose-p:text-gray-300",
                  "prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline",
                  "hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white",
                  "prose-code:bg-gray-100 dark:prose-code:bg-gray-700",
                  "prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
                  "prose-blockquote:border-l-4 prose-blockquote:border-blue-500",
                  "prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20",
                  "prose-blockquote:pl-6 prose-blockquote:italic",
                  isRTL && "prose-headings:font-persian prose-p:font-persian"
                )}
                dir={isRTL ? "rtl" : "ltr"}
                dangerouslySetInnerHTML={{ __html: htmlValue }}
                data-testid="content-preview"
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            فرمت‌های پشتیبانی شده: PNG، JPG، JPEG، WebP، GIF • حداکثر حجم: ۱۰ مگابایت
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>کشیدن و رها کردن تصاویر پشتیبانی می‌شود</span>
          <Palette className="h-3 w-3" />
        </div>
      </div>

      {/* Persian-optimized styling */}
      <style>{`
        .advanced-blog-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          background: #f8fafc;
          border-radius: 8px 8px 0 0;
        }

        .advanced-blog-editor .ql-container {
          border: 1px solid #e2e8f0;
          border-radius: 0 0 8px 8px;
          font-family: "Vazirmatn", "IRANSans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
          font-size: 16px;
          line-height: 1.8;
        }

        .advanced-blog-editor .ql-editor {
          font-size: 16px;
          line-height: 1.8;
          padding: 20px;
        }

        .advanced-blog-editor .ql-editor[dir="rtl"] {
          text-align: right;
          font-family: "Vazirmatn", "IRANSans", ui-sans-serif, system-ui;
        }

        .advanced-blog-editor .ql-editor::before {
          font-style: italic;
          color: #9ca3af;
          right: 20px;
          left: auto;
        }

        .advanced-blog-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }

        /* Dark mode support */
        .dark .advanced-blog-editor .ql-toolbar {
          background: #1f2937;
          border-color: #374151;
        }

        .dark .advanced-blog-editor .ql-container {
          border-color: #374151;
          background: #111827;
        }

        .dark .advanced-blog-editor .ql-editor {
          color: #f3f4f6;
        }

        .dark .advanced-blog-editor .ql-editor::before {
          color: #6b7280;
        }

        .dark .advanced-blog-editor .ql-toolbar .ql-stroke {
          stroke: #d1d5db;
        }

        .dark .advanced-blog-editor .ql-toolbar .ql-fill {
          fill: #d1d5db;
        }

        /* Persian fonts */
        .font-persian {
          font-family: "Vazirmatn", "IRANSans", ui-sans-serif, system-ui !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .advanced-blog-editor .ql-toolbar .ql-formats {
            margin-right: 4px;
          }
          
          .advanced-blog-editor .ql-toolbar button {
            padding: 4px;
          }
          
          .advanced-blog-editor .ql-editor {
            padding: 16px;
            font-size: 16px;
          }
        }

        /* Drag and drop styling */
        .advanced-blog-editor [data-testid="editor-drop-zone"]:dragover {
          border: 2px dashed #3b82f6;
          background-color: rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
}

export default AdvancedBlogEditor;