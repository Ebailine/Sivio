/**
 * GradientText Component - Animated gradient text
 * Creates flowing, animated gradient text effects
 * Uses CSS @property for smooth gradient animation
 */

'use client'

import { ReactNode } from 'react'

interface GradientTextProps {
  children: ReactNode
  className?: string
  colors?: string[]
  animated?: boolean
}

export function GradientText({
  children,
  className = '',
  colors = ['#60A5FA', '#A78BFA', '#EC4899'],
  animated = true
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: animated ? '200% 100%' : '100% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: animated ? 'gradient-shift 3s ease infinite' : 'none',
  }

  return (
    <>
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      <span className={`inline-block ${className}`} style={gradientStyle}>
        {children}
      </span>
    </>
  )
}
