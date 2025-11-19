'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Clock, TrendingUp } from 'lucide-react'

interface BetaCounterProps {
  variant?: 'compact' | 'full'
  showCTA?: boolean
}

export function BetaCounter({ variant = 'full', showCTA = true }: BetaCounterProps) {
  // Static beta count (updates manually when you increase beta access)
  const TOTAL_SPOTS = 500
  const FILLED_SPOTS = 347 // Update this manually as you onboard users
  const REMAINING_SPOTS = TOTAL_SPOTS - FILLED_SPOTS

  // Animated counter
  const [displayCount, setDisplayCount] = useState(FILLED_SPOTS - 20)

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayCount(prev => {
        if (prev < FILLED_SPOTS) return prev + 1
        return prev
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
        <Users className="w-4 h-4" />
        <span className="font-bold text-sm">
          {REMAINING_SPOTS} / {TOTAL_SPOTS} Beta Spots Left
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8 shadow-xl"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4">
          <Clock className="w-5 h-5 text-orange-600 animate-pulse" />
          <span className="font-semibold text-orange-600">Limited Beta Access</span>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">
          Beta Spots Filling Fast
        </h3>
        <p className="text-gray-600">
          Join {displayCount}+ students already getting 10x more interviews
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-6">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${(FILLED_SPOTS / TOTAL_SPOTS) * 100}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-sm font-semibold text-gray-600">
          <span>{displayCount} enrolled</span>
          <span>{REMAINING_SPOTS} remaining</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <motion.div
            className="text-3xl font-black text-orange-600 mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {displayCount}
          </motion.div>
          <div className="text-xs text-gray-600">Beta Users</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-3xl font-black text-red-600 mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            {REMAINING_SPOTS}
          </motion.div>
          <div className="text-xs text-gray-600">Spots Left</div>
        </div>
        <div className="text-center">
          <motion.div
            className="text-3xl font-black text-green-600 mb-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring" }}
          >
            10x
          </motion.div>
          <div className="text-xs text-gray-600">Interview Rate</div>
        </div>
      </div>

      {/* Urgency Message */}
      <motion.div
        className="bg-white border border-orange-200 rounded-xl p-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-gray-900 mb-1">
              {REMAINING_SPOTS < 200 ? '⚠️ Filling Fast' : 'Limited Access'}
            </div>
            <p className="text-sm text-gray-600">
              {REMAINING_SPOTS < 200
                ? `Only ${REMAINING_SPOTS} spots remain before we close beta enrollment. Students are joining daily.`
                : `We're limiting beta access to ${TOTAL_SPOTS} students to maintain quality. Join now before spots fill.`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      {showCTA && (
        <motion.a
          href="/sign-up"
          className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center font-bold py-4 rounded-xl hover:shadow-2xl transition-all"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          Request Beta Access →
        </motion.a>
      )}

      {/* Footer Note */}
      <p className="text-xs text-center text-gray-500 mt-4">
        Free during beta • No credit card required • Join {displayCount}+ students
      </p>
    </motion.div>
  )
}
