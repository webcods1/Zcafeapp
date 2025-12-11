import React, { useState } from 'react';

const TransparentImage = ({ src, alt, className, style, threshold = 240 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onLoad={handleImageLoad}
      onError={() => setImageLoaded(false)}
    />
  );
};

export { TransparentImage };
