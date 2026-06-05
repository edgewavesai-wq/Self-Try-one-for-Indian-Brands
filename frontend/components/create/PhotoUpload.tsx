'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onPhotoSelected: (file: File, preview: string) => void;
  preview?: string;
}

const MAX_PX   = 1024;   // match API generation size — keeps input tokens minimal
const QUALITY  = 0.85;   // JPEG encode quality; 0.85 is visually lossless for portraits

/**
 * Resize + re-encode the image client-side using Canvas before upload.
 * Shrinks a 4-8 MB phone photo to ~150-300 KB → fewer input tokens → lower API cost.
 */
function compressImage(file: File): Promise<{ file: File; preview: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down proportionally so neither dimension exceeds MAX_PX
      if (width > MAX_PX || height > MAX_PX) {
        if (width >= height) {
          height = Math.round((height * MAX_PX) / width);
          width  = MAX_PX;
        } else {
          width  = Math.round((width * MAX_PX) / height);
          height = MAX_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      const preview = canvas.toDataURL('image/jpeg', QUALITY);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback: use original file if canvas fails
            resolve({ file, preview: objectUrl });
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '.jpg'),
            { type: 'image/jpeg' }
          );
          resolve({ file: compressed, preview });
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file, preview: objectUrl }); // fallback to original
    };

    img.src = objectUrl;
  });
}

export default function PhotoUpload({ onPhotoSelected, preview }: Props) {
  const [error, setError]       = useState<string>('');
  const [compressing, setCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[], rejected: unknown[]) => {
    setError('');
    if (rejected.length > 0) {
      setError('Please upload a JPG, PNG, or WebP image under 10MB.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    setCompressing(true);
    try {
      const { file: compressed, preview: prev } = await compressImage(file);
      onPhotoSelected(compressed, prev);
    } finally {
      setCompressing(false);
    }
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
        {compressing ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-sm text-charcoal/60">Optimising photo…</p>
          </div>
        ) : preview ? (
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
