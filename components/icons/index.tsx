import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

export const ShopifyIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M15.8 2.2c-.1 0-.3 0-.4.1-.1 0-2.6.8-2.6.8s-1.7-1.7-1.9-1.9c-.4-.4-1.2-.3-1.5-.2 0 0-.3.1-.8.3-.5-.4-1.1-.6-1.9-.6-2.9 0-4.4 3.6-4.8 5.4-.9.3-1.5.5-1.6.5-.5.2-.5.2-.6.6C.6 6.4 0 10.4 0 10.4l8.4 1.5 7.6-1.4s-.1-8.1-.2-8.3zM13.5 3.4c-.8.2-1.7.5-2.6.8V3.9c0-.7-.1-1.3-.3-1.8.9.1 1.8.7 2.9 1.3zm-3.5.9c-.9.3-1.8.5-2.8.8.3-1.1.9-2.2 1.6-2.9.3-.3.6-.5 1-.6.2.5.2 1.2.2 2.7zm-1.4-3.2c.2 0 .4.1.6.2-.4.2-.8.5-1.2.9-.9.9-1.6 2.3-1.9 3.7l-2.3.7c.4-1.9 1.8-5.1 3.8-5.5z"
      fill="currentColor"
    />
    <path
      d="M15.4 2.3c-.1 0-.3 0-.4.1 0 0-2.6.8-2.6.8s-1.7-1.7-1.9-1.9c-.2-.2-.5-.3-.8-.3v20c0 0 6.4-1.4 7.8-1.7L15.4 2.3z"
      fill="currentColor"
    />
  </svg>
)


export const EtsyIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7.4 3.5h9.1c3.4 0 6.2 2.8 6.2 6.2v4.6c0 3.4-2.8 6.2-6.2 6.2H7.4c-3.4 0-6.2-2.8-6.2-6.2V9.7c0-3.4 2.8-6.2 6.2-6.2zm8.9 4.1c-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4-1.5-3.4-3.4-3.4zm-8.9 0c-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4-1.5-3.4-3.4-3.4z"
      fill="currentColor"
    />
  </svg>
)

export const SquarespaceIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.2 5.2c-2.1-2.1-5.5-2.1-7.6 0L6.4 11.4c-2.1 2.1-2.1 5.5 0 7.6s5.5 2.1 7.6 0l6.2-6.2c2.1-2.1 2.1-5.5 0-7.6zM12 15.6L8.4 12l3.6-3.6L15.6 12 12 15.6z"
      fill="currentColor"
    />
    <path
      d="M3.8 18.8c2.1 2.1 5.5 2.1 7.6 0l6.2-6.2c2.1-2.1 2.1-5.5 0-7.6s-5.5-2.1-7.6 0L3.8 11.2c-2.1 2.1-2.1 5.5 0 7.6zM12 8.4L15.6 12 12 15.6 8.4 12 12 8.4z"
      fill="currentColor"
      fillOpacity="0.6"
    />
  </svg>
)