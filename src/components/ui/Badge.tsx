import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'gray' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'yellow' | 'pink'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    pink: 'bg-pink-100 text-pink-700 border-pink-200',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center justify-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}
