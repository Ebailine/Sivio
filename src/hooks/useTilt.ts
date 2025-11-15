/**
 * useTilt Hook
 * 3D tilt effect on mouse movement with glare effect
 */

'use client'

import { useEffect, useState, RefObject } from 'react'

interface TiltOptions {
  max?: number // Maximum tilt angle in degrees
  perspective?: number // 3D perspective value
  scale?: number // Scale on hover
  speed?: number // Transition speed (ms)
  glare?: boolean // Enable glare effect
  maxGlare?: number // Maximum glare opacity
  reverse?: boolean // Reverse tilt direction
}

interface TiltValues {
  rotateX: number
  rotateY: number
  scale: number
  glareX: number
  glareY: number
  glareOpacity: number
}

export function useTilt(
  ref: RefObject<HTMLElement>,
  options: TiltOptions = {}
): TiltValues {
  const {
    max = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 400,
    glare = true,
    maxGlare = 0.3,
    reverse = false,
  } = options

  const [values, setValues] = useState<TiltValues>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const element = ref.current
    if (!element) return

    const handleMouseEnter = () => {
      setValues((prev) => ({ ...prev, scale }))
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!element) return

      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const percentX = (x - centerX) / centerX
      const percentY = (y - centerY) / centerY

      const direction = reverse ? -1 : 1

      const rotateY = percentX * max * direction
      const rotateX = -percentY * max * direction

      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100

      setValues({
        rotateX,
        rotateY,
        scale,
        glareX,
        glareY,
        glareOpacity: glare ? maxGlare : 0,
      })
    }

    const handleMouseLeave = () => {
      setValues({
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        glareX: 50,
        glareY: 50,
        glareOpacity: 0,
      })
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    // Apply transition to element
    element.style.transition = `transform ${speed}ms ease-out`
    element.style.transformStyle = 'preserve-3d'

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [max, perspective, scale, speed, glare, maxGlare, reverse, ref])

  return values
}
