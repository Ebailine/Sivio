/**
 * useParallax Hook
 * Advanced mouse and scroll tracking for parallax effects
 */

'use client'

import { useEffect, useState, RefObject } from 'react'

interface ParallaxOptions {
  intensity?: number // How much the element moves (0-1)
  reverse?: boolean // Reverse direction
  enableScroll?: boolean // Enable scroll-based parallax
  enableMouse?: boolean // Enable mouse-based parallax
}

interface ParallaxValues {
  x: number
  y: number
  scrollY: number
}

export function useParallax(
  ref: RefObject<HTMLElement>,
  options: ParallaxOptions = {}
): ParallaxValues {
  const {
    intensity = 0.5,
    reverse = false,
    enableScroll = true,
    enableMouse = true,
  } = options

  const [values, setValues] = useState<ParallaxValues>({
    x: 0,
    y: 0,
    scrollY: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!enableMouse && !enableScroll) return

    const handleMouse = (e: MouseEvent) => {
      if (!enableMouse || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const deltaX = (e.clientX - centerX) / window.innerWidth
      const deltaY = (e.clientY - centerY) / window.innerHeight

      const direction = reverse ? -1 : 1

      setValues((prev) => ({
        ...prev,
        x: deltaX * intensity * 100 * direction,
        y: deltaY * intensity * 100 * direction,
      }))
    }

    const handleScroll = () => {
      if (!enableScroll || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const scrollProgress = 1 - (rect.top / window.innerHeight)
      const direction = reverse ? -1 : 1

      setValues((prev) => ({
        ...prev,
        scrollY: scrollProgress * intensity * 100 * direction,
      }))
    }

    if (enableMouse) {
      window.addEventListener('mousemove', handleMouse)
    }
    if (enableScroll) {
      window.addEventListener('scroll', handleScroll)
      handleScroll() // Initial call
    }

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [intensity, reverse, enableScroll, enableMouse, ref])

  return values
}
