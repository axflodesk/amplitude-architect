import React, { useRef, useState } from 'react';
import { IconUpload, IconX, IconWand, IconDocument } from './icons';
import { Button } from './Button';
import { SystemPromptPopover } from './SystemPromptPopover';

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
      <div className="bg-secondary p-6 space-y-4 border-2 border-primary/80">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary">Feature snapshot</label>
          <div
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`
              relative p-6 flex flex-col items-center justify-center transition-colors
              ${imagePreview ? 'border-none p-0' : 'border-2 border-dashed border-primary/20 hover:border-primary/50 hover:bg-gray-50 cursor-pointer'}
            `}
          >
            {imagePreview ? (
              <div className="relative group w-full h-48 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full object-contain cursor-zoom-in"
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  className="absolute top-2 right-2 p-1 bg-white shadow-md text-primary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <IconX width={16} height={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 text-primary flex items-center justify-center mb-3 shadow-sm">
                  <IconUpload width={24} height={24} />
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
          <label className="block text-sm font-semibold text-primary">Feature description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the feature, user flow, or specific interactions you want to track..."
            className="w-full px-4 py-3 border border-primary/10 bg-gray-50 focus:ring-2 focus:ring-primary focus:bg-white outline-none min-h-[120px] resize-none text-sm placeholder:text-primary/40 text-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-primary">Model:</label>
            <div
              className="px-3 py-1 text-xs font-semibold rounded-full"
              style={{
                backgroundColor: '#2B2B2B',
                color: '#f5f5f5',
              }}
            >
              Gemini 3 Pro
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-primary">System prompt:</label>
            <SystemPromptPopover>
              <IconDocument width={16} height={16} style={{ color: 'currentColor' }} />
            </SystemPromptPopover>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={(!description.trim() && !imagePreview) || isGenerating}
          isLoading={isGenerating}
        >
          <IconWand width={20} height={20} style={{ marginRight: '8px' }} />
          Generate events
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
              <IconX width={32} height={32} />
            </button>
            <img
              src={imagePreview}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};
