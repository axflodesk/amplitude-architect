import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Upload icon (8-bit pixel style)
export const IconUpload: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M11 5V3h2v2h2v2h2v2h-2V7h-2v10h-2V7H9v2H7V7h2V5h2zM3 15v6h18v-6h-2v4H5v-4H3z" fill="currentColor"/>
  </svg>
);

// X/Close icon (8-bit pixel style)
export const IconX: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
  </svg>
);

// Wand icon (8-bit pixel style)
export const IconWand: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M19 3H3v4h2v2h2v2h2v2h2v6H7v2h10v-2h-4v-6h2v-2h2V9h2V7h2V3h-2zm0 4H5V5h14v2z" fill="currentColor"/>
  </svg>
);

// Send icon (8-bit pixel style)
export const IconSend: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M11 20h2V8h2V6h-2V4h-2v2H9v2h2v12zM7 10V8h2v2H7zm0 0v2H5v-2h2zm10 0V8h-2v2h2zm0 0v2h2v-2h-2z" fill="currentColor"/>
  </svg>
);

// Robot icon (8-bit pixel style)
export const IconRobot: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M2 5h2v2H2V5zm4 4H4V7h2v2zm2 0H6v2H4v2H2v6h20v-6h-2v-2h-2V9h2V7h2V5h-2v2h-2v2h-2V7H8v2zm0 0h8v2h2v2h2v4H4v-4h2v-2h2V9zm2 4H8v2h2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/>
  </svg>
);

// User icon (8-bit pixel style)
export const IconUser: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M15 2H9v2H7v6h2V4h6V2zm0 8H9v2h6v-2zm0-6h2v6h-2V4zM4 16h2v-2h12v2H6v4h12v-4h2v6H4v-6z" fill="currentColor"/>
  </svg>
);

// Star icon (8-bit pixel style)
export const IconStar: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M18 2h-2v2h2V2zM4 4h6v2H4v14h14v-6h2v8H2V4h2zm4 8H6v6h6v-2h2v-2h-2v2H8v-4zm4-2h-2v2H8v-2h2V8h2V6h2v2h-2v2zm2-6h2v2h-2V4zm4 0h2v2h2v2h-2v2h-2v2h-2v-2h2V8h2V6h-2V4zm-4 8h2v2h-2v-2z" fill="currentColor"/>
  </svg>
);

// Activity icon (8-bit pixel style)
export const IconActivity: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M9 2H5v4h4V2zm7 7V7H2v9h2v6h2v-6h2v6h2V9h6zm-5-7h11v14H11v-2h9V4h-9V2z" fill="currentColor"/>
  </svg>
);

// Table icon (8-bit pixel style)
export const IconTable: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M2 3h20v18H2V3zm2 4v5h7V7H4zm9 0v5h7V7h-7zm7 7h-7v5h7v-5zm-9 5v-5H4v5h7z" fill="currentColor"/>
  </svg>
);

// Download icon (8-bit pixel style)
export const IconDownload: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M13 17V3h-2v10H9v-2H7v2h2v2h2v2h2zm8 2v-4h-2v4H5v-4H3v6h18v-2zm-8-6v2h2v-2h2v-2h-2v2h-2z" fill="currentColor"/>
  </svg>
);

// Copy icon (8-bit pixel style)
export const IconCopy: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor"/>
  </svg>
);

// Check icon (8-bit pixel style)
export const IconCheck: React.FC<IconProps> = ({ width = 24, height = 24, className, style }) => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={width} height={height} className={className} style={style}>
    <path d="M18 6h2v2h-2V6zm-2 4V8h2v2h-2zm-2 2v-2h2v2h-2zm-2 2h2v-2h-2v2zm-2 2h2v-2h-2v2zm-2 0v2h2v-2H8zm-2-2h2v2H6v-2zm0 0H4v-2h2v2z" fill="currentColor"/>
  </svg>
);
