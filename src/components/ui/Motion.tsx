'use client'

import dynamic from 'next/dynamic'

// Loading component that returns null to avoid any rendering during SSR
const Loading = () => null

// Dynamically import framer-motion with no SSR
export const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.div),
  { ssr: false, loading: Loading }
)

export const MotionSpan = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.span),
  { ssr: false, loading: Loading }
)

export const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.button),
  { ssr: false, loading: Loading }
)

export const MotionNav = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.nav),
  { ssr: false, loading: Loading }
)

export const MotionH1 = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.h1),
  { ssr: false, loading: Loading }
)

// Also export AnimatePresence
export const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod) => mod.AnimatePresence),
  { ssr: false, loading: Loading }
)
