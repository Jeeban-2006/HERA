'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { LabValues } from '@/types/pcod.types';

interface LabValuesFormProps {
  data: LabValues;
  onChange: (data: LabValues) => void;
}

const LAB_FIELDS: { key: keyof LabValues; label: string; unit: string; placeholder: string }[] = [
  { key: 'insulin', label: 'Fasting Insulin', unit: 'µIU/mL', placeholder: 'e.g. 10.2' },
  { key: 'testosterone', label: 'Free Testosterone', unit: 'pg/mL', placeholder: 'e.g. 2.8' },
  { key: 'lhFsh', label: 'LH/FSH Ratio', unit: 'ratio', placeholder: 'e.g. 1.8' },
  { key: 'amh', label: 'AMH', unit: 'ng/mL', placeholder: 'e.g. 3.1' },
  { key: 'glucose', label: 'Fasting Glucose', unit: 'mg/dL', placeholder: 'e.g. 88' },
];

export function LabValuesForm({ data, onChange }: LabValuesFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof LabValues) => (value: string) =>
    onChange({ ...data, [key]: value });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate OCR processing
    setIsUploading(true);
    setUploadSuccess(false);
    
    setTimeout(() => {
      onChange({
        insulin: '12.4',
        testosterone: '3.1',
        lhFsh: '2.4',
        amh: '4.5',
        glucose: '94'
      });
      setIsUploading(false);
      setUploadSuccess(true);
      
      // Reset success state after a while
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-body text-text-muted">All fields are</span>
        <span className="px-2 py-0.5 rounded text-xs bg-bio-teal/10 text-bio-teal border border-bio-teal/30 font-mono">
          optional
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LAB_FIELDS.map(({ key, label, unit, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-body text-text-muted uppercase tracking-wide">
              {label}
            </label>
            <div className="relative">
              <input
                type="number"
                value={data[key]}
                onChange={(e) => update(key)(e.target.value)}
                placeholder={placeholder}
                className="input-base pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted font-mono">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Upload Zone */}
      <input 
        type="file" 
        accept=".pdf,.jpg,.jpeg,.png" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <div
        onClick={handleUploadClick}
        className={cn(
          'border-2 border-dashed border-white/15 rounded-xl p-6 flex flex-col items-center gap-3',
          'hover:border-bio-teal/50 hover:bg-bio-teal/5 transition-all duration-300 cursor-pointer group',
          isUploading && 'pointer-events-none opacity-80',
          uploadSuccess && 'border-bio-teal bg-bio-teal/10'
        )}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-bio-teal animate-spin" />
        ) : uploadSuccess ? (
          <CheckCircle2 className="w-8 h-8 text-bio-teal" />
        ) : (
          <Upload className="w-8 h-8 text-text-muted group-hover:text-bio-teal transition-colors" />
        )}
        
        <div className="text-center">
          <p className={cn("text-sm font-body transition-colors", 
            uploadSuccess ? "text-bio-teal font-bold" : "text-text-muted group-hover:text-text-primary"
          )}>
            {isUploading ? "Scanning Lab Report using AI..." : uploadSuccess ? "Extracted Lab Values!" : "Upload lab report PDF"}
          </p>
          {!isUploading && !uploadSuccess && (
            <p className="text-xs text-text-muted mt-1">PDF, JPG, PNG up to 10MB</p>
          )}
        </div>
      </div>
    </div>
  );
}
