'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onPhotoSelected: (file: File, preview: string) => void;
  preview?: string;
}

export default function PhotoUpload({ onPhotoSelected, preview }: Props) {
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejected: unknown[]) => {
    setError('');
    if (rejected.length > 0) {
      setError('Please upload a JPG, PNG, or WebP image under 10MB.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onPhotoSelected(file, url);
  }, [onPhotoSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-playfair text-3xl font-bold text-navy mb-2">Upload Your Photo</h2>
        <p className="text-charcoal/60 text-sm">Upload a clear upper-body or full-body photo for best results</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-gold bg-gold/5' : 'border-gold/30 hover:border-gold/60 hover:bg-gold/5'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-contain" />
            <p className="text-sm text-charcoal/60">Click or drag to replace photo</p>
          </div>
        ) : (
          <div>
            <div className="text-5xl mb-4">📸</div>
            <p className="font-playfair text-lg font-bold text-navy mb-2">
              {isDragActive ? 'Drop your photo here' : 'Drag & drop your photo'}
            </p>
            <p className="text-sm text-charcoal/50">or click to browse · JPG, PNG, WebP · max 10MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-navy/5 rounded-xl p-4">
        <p className="text-xs text-charcoal/60 font-medium mb-2">📌 Tips for best results:</p>
        <ul className="text-xs text-charcoal/60 space-y-1 list-disc list-inside">
          <li>Stand upright facing the camera</li>
          <li>Good lighting, neutral background preferred</li>
          <li>Upper body clearly visible</li>
          <li>Avoid heavy patterns on existing clothing</li>
        </ul>
      </div>
    </div>
  );
}
