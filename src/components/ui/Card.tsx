/**
 * Card Component - Simple, clean card with minimal hover effects
 * Used for functional pages (Contact, Help, Blog, etc.)
 * Follows Linear/Notion/Stripe best practices for product pages
 */

import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200'
  const hoverClasses = onClick
    ? 'hover:shadow-lg hover:border-gray-300 cursor-pointer'
    : 'hover:shadow-md hover:border-gray-300'

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
