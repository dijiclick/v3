import { useState, useRef, useMemo, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  productId?: string; // Optional product ID to associate images with
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content here...", 
  className,
  productId 
}: RichTextEditorProps) {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Custom image upload handler
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
        title: "Invalid File Type",
        description: "Please select a PNG, JPG, JPEG, or WebP image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (productId) {
        formData.append("productId", productId);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 10;
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/images", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
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
        title: "Image Uploaded",
        description: "Image has been successfully added to your content.",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
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
  }, [productId, toast]);

  // Custom toolbar configuration
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ align: [] }],
          [{ direction: "rtl" }], // RTL support
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ color: [] }, { background: [] }],
          ["link", "image"],
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
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "align",
    "direction",
    "list",
    "bullet",
    "indent",
    "color",
    "background",
    "link",
    "image",
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        data-testid="image-upload-input"
      />
      
      {/* Upload progress indicator */}
      {uploadProgress !== null && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b p-3">
          <div className="flex items-center gap-3">
            <Upload className="h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">
                  {isUploading ? "Uploading image..." : "Upload complete!"}
                </span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* React Quill Editor */}
      <div className="rich-text-editor">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            minHeight: "200px",
          }}
          data-testid="rich-text-editor"
        />
      </div>

      {/* File size and format info */}
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
        <AlertCircle className="h-3 w-3" />
        <span>Supported formats: PNG, JPG, JPEG, WebP • Max size: 5MB</span>
      </div>

      <style>{`
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-bottom: none;
          background: #f8fafc;
          border-radius: 8px 8px 0 0;
        }

        .rich-text-editor .ql-container {
          border: 1px solid #e2e8f0;
          border-radius: 0 0 8px 8px;
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
          min-height: 200px;
        }

        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
          padding: 16px;
        }

        .rich-text-editor .ql-editor::before {
          font-style: italic;
          color: #9ca3af;
        }

        /* Persian/RTL support */
        .rich-text-editor .ql-editor[dir="rtl"] {
          text-align: right;
          font-family: "Vazir", "IRANSans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
        }

        /* Custom toolbar styling */
        .rich-text-editor .ql-toolbar .ql-formats {
          margin-right: 8px;
        }

        .rich-text-editor .ql-toolbar button:hover {
          background-color: #e2e8f0;
        }

        .rich-text-editor .ql-toolbar button.ql-active {
          background-color: #3b82f6;
          color: white;
        }

        /* Dark mode support */
        .dark .rich-text-editor .ql-toolbar {
          background: #1f2937;
          border-color: #374151;
        }

        .dark .rich-text-editor .ql-container {
          border-color: #374151;
          background: #111827;
        }

        .dark .rich-text-editor .ql-editor {
          color: #f3f4f6;
        }

        .dark .rich-text-editor .ql-editor::before {
          color: #6b7280;
        }

        .dark .rich-text-editor .ql-toolbar button:hover {
          background-color: #374151;
        }

        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #d1d5db;
        }

        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #d1d5db;
        }

        /* Image styling within editor */
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }

        /* Focus styles */
        .rich-text-editor .ql-container.ql-snow {
          border: 1px solid #e2e8f0;
          transition: border-color 0.2s;
        }

        .rich-text-editor .ql-editor:focus {
          outline: none;
        }

        .rich-text-editor .ql-container:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .rich-text-editor .ql-toolbar .ql-formats {
            margin-right: 4px;
          }
          
          .rich-text-editor .ql-toolbar button {
            padding: 4px;
          }
          
          .rich-text-editor .ql-editor {
            padding: 12px;
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;