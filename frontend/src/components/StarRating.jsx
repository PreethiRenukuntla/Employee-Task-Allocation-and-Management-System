import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform duration-100 ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`${sizes[size]} transition-colors duration-150 ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
