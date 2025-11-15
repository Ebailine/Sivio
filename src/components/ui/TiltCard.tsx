'use client'

import { ReactNode, useRef, MouseEvent } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
  intensity?: number
  onClick?: () => void
}

export function TiltCard({ children, className = '', intensity = 15, onClick }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * intensity
    const rotateY = ((centerX - x) / centerX) * intensity

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        relative
        bg-white rounded-2xl p-8
        border border-gray-200/50 shadow-lg
        transition-all duration-200 ease-out
        transform-gpu
        hover:shadow-2xl
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {/* Glare effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.3) 0%, transparent 50%)'
        }}
      />

      {/* Content with 3D depth */}
      <div style={{ transform: 'translateZ(50px)' }}>
        {children}
      </div>
    </div>
  )
}
