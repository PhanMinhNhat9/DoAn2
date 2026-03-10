
import React, { useState } from 'react';
import { 
  UploadCloud as CloudUpload, 
  Sparkles as AutoAwesome, 
  PenLine as EditNote, 
  RefreshCw, 
  Image as PhotoLibrary,
  Send
} from 'lucide-react';
import { User } from '../types';
import { generateFoodAnalysis } from '../services/geminiService';

const API_BASE_URL = 'http://localhost/DoAn2/api';

interface CreatePageProps {
  user: User | null;
  onPostCreated: () => void;
}

const CreatePage: React.FC<CreatePageProps> = ({ user, onPostCreated }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [caption, setCaption] = useState('');
  const [recipe, setRecipe] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [tags, setTags] = useState<string[]>(['#PhoBo', '#VietnameseFood']);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    setAnalyzing(true);
    try {
      const base64Data = preview.split(',')[1];
      const mimeType = preview.split(';')[0].split(':')[1];
      const result = await generateFoodAnalysis(base64Data, mimeType);
      setCaption(result.caption);
      setRecipe(result.recipe);
    } catch (error) {
      console.error(error);
      setCaption("Lỗi khi phân tích hình ảnh.");
      setRecipe("Không thể tạo công thức.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddTag = () => {
    const tag = prompt("Nhập thẻ tag (bao gồm dấu #):");
    if (tag && tag.startsWith('#')) setTags([...tags, tag]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 scrollbar-hide">
      <div className="text-center mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Tạo Bài Viết Món Ăn Mới</h1>
        <p className="text-slate-500 dark:text-text-secondary text-base max-w-2xl mx-auto">Tải lên hình ảnh món ăn Việt Nam hấp dẫn và để AI của chúng tôi viết mô tả hoàn hảo cho bạn.</p>
      </div>
      <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl p-8 shadow-xl max-w-4xl mx-auto">
        <div className="mb-8">
          <label className="relative group cursor-pointer block">
            <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 dark:border-surface-border rounded-xl bg-slate-50 dark:bg-background-dark/50 hover:bg-slate-100 dark:hover:bg-background-dark hover:border-primary/50 transition-all duration-300 overflow-hidden">
              {preview ? (
                <img src={preview} alt="Xem trước" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="mb-4 text-primary bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <CloudUpload className="w-8 h-8" />
                  </div>
                  <p className="mb-2 text-sm text-slate-900 dark:text-white font-semibold">Nhấn để tải lên hoặc kéo thả vào đây</p>
                  <p className="text-xs text-slate-500 dark:text-text-muted">Định dạng JPG, PNG hoặc WEBP (Tối đa 10MB)</p>
                </div>
              )}
            </div>
            <input className="hidden" type="file" onChange={handleFileChange} />
          </label>
        </div>
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleAnalyze}
            disabled={!preview || analyzing}
            className="relative group bg-gradient-to-r from-primary to-emerald-400 hover:from-primary hover:to-primary text-white font-bold text-base py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2 overflow-hidden disabled:opacity-50"
          >
            <AutoAwesome className={`w-5 h-5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Đang phân tích...' : 'Phân tích bằng AI'}</span>
          </button>
        </div>
        <div className="relative flex py-5 items-center mb-8">
          <div className="flex-grow border-t border-slate-200 dark:border-surface-border"></div>
          <span className="flex-shrink-0 mx-4 text-slate-500 dark:text-text-muted text-sm uppercase tracking-wider font-semibold">Kết quả phân tích</span>
          <div className="flex-grow border-t border-slate-200 dark:border-surface-border"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="aspect-square rounded-lg bg-slate-100 dark:bg-surface-border/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-surface-border">
              {preview ? (
                <img src={preview} alt="Xem trước" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 dark:text-text-muted text-sm flex flex-col items-center gap-2">
                  <PhotoLibrary className="w-8 h-8 opacity-50" />
                  <span>Preview</span>
                </span>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <label className="text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                <EditNote className="text-primary w-5 h-5" />
                Mô tả viết bởi AI (Tiếng Việt)
              </label>
              <button 
                onClick={handleAnalyze}
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Tạo lại
              </button>
            </div>
            <textarea 
              className="flex-1 w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-border rounded-lg p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all text-sm leading-relaxed" 
              placeholder="Mô tả do AI tạo sẽ hiện ở đây..." 
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            ></textarea>

            <div className="flex justify-between items-center mt-2">
              <label className="text-slate-900 dark:text-white text-sm font-semibold flex items-center gap-2">
                <AutoAwesome className="text-primary w-5 h-5" />
                Công thức nấu ăn (AI đề xuất)
              </label>
            </div>
            <textarea 
              className="flex-1 w-full bg-slate-50 dark:bg-background-dark border border-slate-200 dark:border-surface-border rounded-lg p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-text-muted focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-all text-sm leading-relaxed" 
              placeholder="Công thức do AI tạo sẽ hiện ở đây..." 
              rows={8}
              value={recipe}
              onChange={(e) => setRecipe(e.target.value)}
            ></textarea>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="bg-primary/10 text-primary border border-primary/20 text-xs px-2 py-1 rounded-md cursor-pointer hover:bg-primary/20 transition-colors">{tag}</span>
              ))}
              <span onClick={handleAddTag} className="bg-slate-100 dark:bg-surface-border text-slate-500 dark:text-text-muted text-xs px-2 py-1 rounded-md cursor-pointer hover:text-white transition-colors border border-transparent hover:border-surface-border">+ Thêm Thẻ</span>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-background-dark rounded-lg p-4 border border-slate-200 dark:border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-surface-dark rounded-lg p-1 border border-slate-200 dark:border-surface-border">
              <button onClick={() => setPrivacy('public')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${privacy === 'public' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>Công khai</button>
              <button onClick={() => setPrivacy('private')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${privacy === 'private' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>Riêng tư</button>
            </div>
            <span className="text-xs text-slate-500 dark:text-text-muted hidden sm:block">Hiển thị với {privacy === 'public' ? 'tất cả mọi người' : 'chỉ mình bạn'}</span>
          </div>
          <button 
            onClick={async () => {
              if (!preview || !caption) return;
              setIsPosting(true);
              try {
                const response = await fetch(`${API_BASE_URL}/create_post.php`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user?.id, 
                    imageUrl: preview,
                    caption: caption,
                    recipe: recipe,
                    aiAnalysis: "Đã phân tích bởi VietFood AI",
                    tags: tags,
                    privacy: privacy
                  })
                });
                const result = await response.json();
                if (!result.error) {
                  onPostCreated();
                }
              } catch (error) {
                console.error(error);
              } finally {
                setIsPosting(false);
              }
            }}
            disabled={isPosting || !preview}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isPosting ? 'Đang đăng...' : 'Đăng lên Cộng đồng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
