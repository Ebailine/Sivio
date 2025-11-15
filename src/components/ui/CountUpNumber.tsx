'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpNumberProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUpNumber({
  end,
  duration = 2000,
  suffix = '',
  prefix = ''
}: CountUpNumberProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)

          const startTime = Date.now()
          const startValue = 0

          const animate = () => {
            const now = Date.now()
            const progress = Math.min((now - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            const currentCount = Math.floor(easeOutQuart * (end - startValue) + startValue)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [end, duration, hasStarted])

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
