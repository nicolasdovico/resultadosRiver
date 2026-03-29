'use client';

import { useState, useEffect } from 'react';

interface ClubShieldProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
}

export default function ClubShield({ 
  src, 
  alt = 'Club Shield', 
  className = 'w-6 h-6 object-contain shrink-0',
  fallbackSrc = 'https://via.placeholder.com/40?text=R'
}: ClubShieldProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  // Update internal state if src prop changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
