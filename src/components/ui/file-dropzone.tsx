import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button } from './button';

interface FileDropzoneProps {
  onFileSelect: (file: File | null) => void;
  accept: string[];
  maxSizeMb?: number;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  accept,
  maxSizeMb = 10,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate type
      const isAcceptedType = accept.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAcceptedType) {
        setError(`File type not supported. Accepted types: ${accept.join(', ')}`);
        return;
      }

      // Validate size
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File is too large. Maximum size is ${maxSizeMb}MB.`);
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    },
    [accept, maxSizeMb, onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        validateAndHandleFile(files[0]);
      }
    },
    [disabled, validateAndHandleFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndHandleFile(e.target.files[0]);
      }
    },
    [validateAndHandleFile]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
    setError(null);
  };

  const handleBoxClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  if (selectedFile) {
    return (
      <div className="border border-brand-200 bg-brand-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-brand-600 shadow-sm border border-brand-100 mb-3">
          <FileIcon className="h-6 w-6" />
        </div>
        <p className="font-medium text-brand-900 truncate max-w-[200px] mb-1">
          {selectedFile.name}
        </p>
        <p className="text-xs text-brand-700 mb-4">
          {formatFileSize(selectedFile.size)}
        </p>
        <Button variant="outline" size="sm" onClick={handleClear} className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200">
          <X className="h-4 w-4 mr-1.5" />
          Remove File
        </Button>
      </div>
    );
  }

  return (
    <div
      onClick={handleBoxClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer',
        isDragOver
          ? 'border-brand-500 bg-brand-50'
          : error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-gray-300'
      )}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept.join(',')}
        disabled={disabled}
      />
      
      <div className={cn(
        "h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors",
        isDragOver ? "bg-brand-100 text-brand-600" : error ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
      )}>
        <UploadCloud className="h-6 w-6" />
      </div>

      <p className="text-sm font-medium text-navy-900 mb-1">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-muted-foreground">
        PDF, JPG, or PNG (max {maxSizeMb}MB)
      </p>

      {error && (
        <p className="text-sm text-red-600 font-medium mt-3 bg-red-100/50 px-3 py-1 rounded">
          {error}
        </p>
      )}
    </div>
  );
}
