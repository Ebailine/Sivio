import React from 'react'

export interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-lg'
      case 'text':
      default:
        return 'rounded'
    }
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${getVariantClasses()} ${className}`}
      style={{
        ...style,
        animation: 'shimmer 1.5s infinite',
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

// Preset skeleton layouts
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <Skeleton variant="rectangular" width="100%" height={200} className="mb-4" />
    <Skeleton variant="text" width="80%" height={24} className="mb-2" />
    <Skeleton variant="text" width="60%" height={20} className="mb-4" />
    <Skeleton variant="text" width="100%" height={16} />
  </div>
)

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" height={20} className="mb-2" />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
        </div>
      </div>
    ))}
  </div>
)
