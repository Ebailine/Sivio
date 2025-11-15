/**
 * InteractiveCard Component
 * Advanced card with 3D tilt, glow effect, and optional flip animation
 */

'use client'

import { useRef, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useTilt } from '@/hooks/useTilt'

interface InteractiveCardProps {
  children: ReactNode
  className?: string
  tilt?: boolean
  glow?: boolean
  flip?: boolean
  frontContent?: ReactNode
  backContent?: ReactNode
  maxTilt?: number
  glareEffect?: boolean
  hoverScale?: number
}

export default function InteractiveCard({
  children,
  className = '',
  tilt = true,
  glow = true,
  flip = false,
  frontContent,
  backContent,
  maxTilt = 10,
  glareEffect = true,
  hoverScale = 1.02,
}: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  const tiltValues = useTilt(cardRef as any, {
    max: tilt ? maxTilt : 0,
    scale: hoverScale,
    glare: glareEffect,
    maxGlare: 0.2,
  })

  const handleClick = () => {
    if (flip && frontContent && backContent) {
      setIsFlipped(!isFlipped)
    }
  }

  const cardStyle = tilt
    ? {
        transform: `
          perspective(1000px)
          rotateX(${tiltValues.rotateX}deg)
          rotateY(${tiltValues.rotateY}deg)
          scale(${tiltValues.scale})
        `,
      }
    : {}

  const glareStyle = glareEffect && tilt
    ? {
        background: `radial-gradient(
          circle at ${tiltValues.glareX}% ${tiltValues.glareY}%,
          rgba(255, 255, 255, ${tiltValues.glareOpacity}),
          transparent 50%
        )`,
      }
    : {}

  if (flip && frontContent && backContent) {
    return (
      <div
        ref={cardRef}
        className={`relative cursor-pointer ${className}`}
        style={cardStyle}
        onClick={handleClick}
      >
        <motion.div
          className="relative w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl bg-white border border-gray-200/50 shadow-lg overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {frontContent}
            {glareEffect && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={glareStyle}
              />
            )}
            {glow && (
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            )}
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {backContent}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`relative group ${className}`}
      style={cardStyle}
    >
      <div className="relative rounded-2xl bg-white border border-gray-200/50 shadow-lg overflow-hidden h-full">
        {children}

        {/* Glare Effect */}
        {glareEffect && tilt && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={glareStyle}
          />
        )}

        {/* Glow Effect */}
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        )}
      </div>
    </div>
  )
}
