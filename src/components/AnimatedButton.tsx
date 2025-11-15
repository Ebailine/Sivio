/**
 * AnimatedButton Component
 * Advanced button with ripple effect, magnetic interaction, and gradient animations
 */

'use client'

import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface AnimatedButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  magnetic?: boolean
  ripple?: boolean
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function AnimatedButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  magnetic = true,
  ripple = true,
  className = '',
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [isHovered, setIsHovered] = useState(false)
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!magnetic || disabled || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * 0.2
    const deltaY = (e.clientY - centerY) * 0.2

    setMagneticOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMagneticOffset({ x: 0, y: 0 })
  }

  const handleClick = (e: ReactMouseEvent) => {
    if (disabled) return

    if (ripple) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples((prev) => [...prev, { x, y, id }])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)
    }

    onClick?.()
  }

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
    xl: 'px-10 py-5 text-xl rounded-2xl',
  }

  const baseStyles = `
    relative overflow-hidden font-semibold
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `

  const content = (
    <>
      <motion.span
        className="relative z-10 flex items-center justify-center gap-2"
        animate={{ scale: isHovered ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>

      {/* Ripple Effect */}
      {ripple && ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{ width: 0, height: 0, x: '-50%', y: '-50%' }}
          animate={{ width: 500, height: 500, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}

      {/* Hover Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
    </>
  )

  if (href && !disabled) {
    return (
      <motion.div
        animate={{
          x: magneticOffset.x,
          y: magneticOffset.y,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Link
          href={href}
          ref={buttonRef as any}
          className={baseStyles}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick as any}
        >
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      animate={{
        x: magneticOffset.x,
        y: magneticOffset.y,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <button
        ref={buttonRef as any}
        type={type}
        disabled={disabled}
        className={baseStyles}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {content}
      </button>
    </motion.div>
  )
}
