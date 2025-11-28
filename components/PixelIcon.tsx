import React from 'react';

interface PixelIconProps {
  children: React.ReactElement;
  size?: number;
  className?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ children, size, className }) => {
  // Clone the icon and modify its SVG properties for sharper edges
  const modifiedIcon = React.cloneElement(children, {
    className: `${children.props.className || ''} ${className || ''}`.trim(),
    // The SVG modification happens via CSS in the parent
  });

  return (
    <span
      className="pixel-icon-wrapper"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {modifiedIcon}
    </span>
  );
};
