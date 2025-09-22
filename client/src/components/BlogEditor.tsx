import { useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Image as ImageIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  isLoading?: boolean;
}

export function BlogEditor({ content, onChange, onSave, isLoading = false }: BlogEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Custom image upload handler
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطا در آپلود تصویر",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Handle image insertion
  const insertImage = useCallback(async (file: File) => {
    const imageUrl = await handleImageUpload(file);
    if (imageUrl && quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      quill.insertEmbed(index, 'image', imageUrl);
      quill.setSelection(index + 1, 0);
    }
  }, [handleImageUpload]);

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      insertImage(file);
    }
    // Reset input value so the same file can be selected again
    e.target.value = '';
  }, [insertImage]);

  // Custom toolbar with WordPress Gutenberg-like options
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ],
      handlers: {
        // Custom image handler will be handled by the image button below
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
    'color', 'background', 'align',
    'code-block'
  ];

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800" data-testid="blog-editor-title">
            ویرایشگر محتوای وبلاگ
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
            >
              <ImageIcon className="w-4 h-4 ml-2" />
              افزودن تصویر
            </Button>
            <Button
              onClick={onSave}
              disabled={isLoading}
              size="sm"
              data-testid="button-save-blog"
            >
              <Save className="w-4 h-4 ml-2" />
              {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-image-upload"
        />

        <div 
          className="bg-white rounded-lg border border-gray-300 overflow-hidden min-h-[400px]"
          data-testid="blog-editor-container"
        >
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="شروع به نوشتن محتوای وبلاگ کنید..."
            style={{
              height: '350px',
              direction: 'rtl'
            }}
            data-testid="rich-text-editor"
          />
        </div>

        <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Upload className="w-4 h-4 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">راهنمای استفاده:</p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• برای افزودن تصویر، روی دکمه "افزودن تصویر" کلیک کنید</li>
                <li>• از تولبار برای قالب‌بندی متن استفاده کنید</li>
                <li>• تغییرات به صورت خودکار ذخیره می‌شوند</li>
                <li>• حداکثر حجم فایل تصاویر: ۵ مگابایت</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}