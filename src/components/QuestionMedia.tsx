import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface QuestionMediaProps {
  imageUrl?: string;
  svgDiagram?: string;
  caption?: string;
  alt?: string;
  compact?: boolean;
}

export const QuestionMedia: React.FC<QuestionMediaProps> = ({
  imageUrl,
  svgDiagram,
  caption,
  alt = 'Ilustrasi soal ujian',
  compact = false,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl && !svgDiagram) return null;

  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {imageUrl && !imgError ? (
        <div className="flex items-center justify-center bg-white p-3">
          <img
            src={imageUrl}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`w-full rounded-lg object-contain ${
              compact ? 'max-h-56' : 'max-h-80'
            }`}
          />
        </div>
      ) : svgDiagram ? (
        <div
          className={`flex items-center justify-center bg-white p-4 ${
            compact ? 'max-h-56' : 'max-h-72'
          }`}
          dangerouslySetInnerHTML={{ __html: svgDiagram }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 bg-slate-100 px-6 py-10 text-center text-slate-500">
          <ImageIcon className="h-8 w-8 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{caption || alt}</span>
        </div>
      )}
      {caption && (
        <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
