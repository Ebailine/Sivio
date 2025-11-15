/**
 * ParallaxSection Component
 * Wrapper component for parallax scrolling effects
 */

'use client'

import { useRef, ReactNode } from 'react'
import { MotionDiv } from '@/components/ui/Motion'
import { ClientOnly } from '@/components/ui/ClientOnly'
import { useParallax } from '@/hooks/useParallax'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  intensity?: number
  reverse?: boolean
  enableMouse?: boolean
  enableScroll?: boolean
  offset?: number
}

export default function ParallaxSection({
  children,
  className = '',
  intensity = 0.5,
  reverse = false,
  enableMouse = true,
  enableScroll = true,
  offset = 0,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  const parallaxValues = useParallax(sectionRef as any, {
    intensity,
    reverse,
    enableMouse,
    enableScroll,
  })

  return (
    <ClientOnly>
      <MotionDiv
        ref={sectionRef as any}
        className={`relative ${className}`}
        style={{
          transform: `translate(${parallaxValues.x}px, ${parallaxValues.y + parallaxValues.scrollY + offset}px)`,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        {children}
      </MotionDiv>
    </ClientOnly>
  )
}
