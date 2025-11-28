import React, { useRef, useState } from 'react';
import { Upload, X, Wand2 } from 'lucide-react';
import { Button } from './Button';

interface InputSectionProps {
  description: string;
  setDescription: (value: string) => void;
  imagePreview: string | null;
  setImagePreview: (value: string | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
  description, 
  setDescription, 
  imagePreview, 
  setImagePreview, 
  onGenerate, 
  isGenerating 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size must be less than 4MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (description.trim() || imagePreview) {
      onGenerate();
    }
  };

  return (
    <>
      <div className="bg-secondary p-6 rounded-xl space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">Feature Snapshot (Optional)</label>
          <div 
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`
              relative rounded-lg p-6 flex flex-col items-center justify-center transition-colors
              ${imagePreview ? 'border-none p-0' : 'border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-gray-50 cursor-pointer'}
            `}
          >
            {imagePreview ? (
              <div className="relative group w-full h-48 flex justify-center">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-full object-contain rounded-md cursor-zoom-in"
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-primary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 text-primary rounded-full flex items-center justify-center mb-3 shadow-sm">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-primary">Click to upload a screenshot</p>
                <p className="text-xs text-primary/60 mt-1">PNG, JPG up to 4MB</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">Feature Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the feature, user flow, or specific interactions you want to track..."
            className="w-full px-4 py-3 border border-primary/10 bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white outline-none min-h-[120px] resize-y text-sm placeholder:text-primary/40 text-primary transition-colors"
          />
        </div>

        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit} 
          disabled={(!description.trim() && !imagePreview) || isGenerating}
          isLoading={isGenerating}
        >
          <Wand2 className="w-5 h-5 mr-2" />
          Generate Events
        </Button>
      </div>

      {/* Image Modal */}
      {isModalOpen && imagePreview && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img 
              src={imagePreview} 
              alt="Full size" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
};
