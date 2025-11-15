'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import Link from 'next/link'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'gradient' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>) {
  const baseClasses = `
    relative overflow-hidden
    inline-flex items-center justify-center gap-2
    font-semibold rounded-xl
    transform transition-all duration-200
    hover:scale-105 active:scale-95
    before:absolute before:inset-0
    before:bg-white/20 before:transform before:scale-x-0
    before:transition-transform before:duration-300 before:origin-left
    hover:before:scale-x-100
  `

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    gradient: `
      bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
      text-white shadow-lg hover:shadow-2xl
      animate-gradient-x
    `,
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span className="relative z-10">{children}</span>
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      <span className="relative z-10">{children}</span>
    </button>
  )
}
