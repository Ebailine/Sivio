/**
 * MouseGradient Component - Interactive gradient that follows mouse movement
 * Inspired by Vercel's direction-aware gradient effects
 * Creates an engaging, premium feel for hero sections
 */

'use client'

import { useEffect, useRef, useState } from 'react'

interface MouseGradientProps {
  className?: string
  colors?: string[]
  blur?: string
}

export function MouseGradient({
  className = '',
  colors = ['rgba(59, 130, 246, 0.5)', 'rgba(168, 85, 247, 0.5)', 'rgba(236, 72, 153, 0.5)'],
  blur = '100px'
}: MouseGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className="absolute w-full h-full transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
          filter: `blur(${blur})`,
          opacity: 0.6,
        }}
      />
    </div>
  )
}
