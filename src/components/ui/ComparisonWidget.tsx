'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Target, XCircle, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react'

export function ComparisonWidget() {
  const [activeView, setActiveView] = useState<'mass' | 'sivio'>('mass')

  // Auto-switch between views every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveView(prev => prev === 'mass' ? 'sivio' : 'mass')
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const massApplications = Array.from({ length: 100 }, (_, i) => i)
  const sivioApplications = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveView('mass')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeView === 'mass'
              ? 'bg-red-600 text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Mass Application Platforms
        </button>
        <button
          onClick={() => setActiveView('sivio')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeView === 'sivio'
              ? 'bg-green-600 text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          Sivio (Quality-First)
        </button>
      </div>

      {/* Comparison Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 border-2 border-gray-200 overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeView === 'mass' ? (
            <motion.div
              key="mass"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-4">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-600">Mass Application Approach</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Simplify, Handshake, Others</h3>
                <p className="text-gray-600">Spam 100+ applications → Hope something sticks</p>
              </div>

              {/* Application Grid (Chaotic) */}
              <div className="relative h-64">
                <div className="absolute inset-0 flex flex-wrap gap-1 justify-center items-center">
                  {massApplications.map((app, index) => (
                    <motion.div
                      key={`mass-${app}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: [0, 1, 0.3],
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.01,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="w-8 h-8 bg-red-200 rounded-lg border border-red-300 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 0.8, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Black Hole Effect */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-black rounded-full opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Results */}
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mt-8">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-4xl font-black text-red-600 mb-1">100+</div>
                    <div className="text-sm text-gray-600">Applications Sent</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-red-600 mb-1">2</div>
                    <div className="text-sm text-gray-600">Interviews (2-4%)</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-red-600 mb-1">100+</div>
                    <div className="text-sm text-gray-600">Hours Wasted</div>
                  </div>
                </div>
                <p className="text-center text-red-700 font-semibold mt-4 text-sm">
                  96% rejection rate. Most applications go into a black hole.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sivio"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-600">Quality-First Approach</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Sivio</h3>
                <p className="text-gray-600">Target 10-20 perfect fits → Direct hiring manager access</p>
              </div>

              {/* Application Grid (Strategic) */}
              <div className="relative h-64 flex flex-col justify-center">
                {/* Strategic Applications */}
                <div className="flex flex-wrap gap-3 justify-center items-center mb-8">
                  {sivioApplications.map((app, index) => (
                    <motion.div
                      key={`sivio-${app}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="relative"
                    >
                      <motion.div
                        className="w-12 h-12 bg-green-200 rounded-xl border-2 border-green-400 flex items-center justify-center shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        animate={{
                          boxShadow: index < 3 ? [
                            "0 0 0 0 rgba(34, 197, 94, 0.4)",
                            "0 0 0 10px rgba(34, 197, 94, 0)",
                          ] : undefined
                        }}
                        transition={{
                          boxShadow: { duration: 1.5, repeat: Infinity }
                        }}
                      >
                        {index < 3 ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <Target className="w-6 h-6 text-green-600" />
                        )}
                      </motion.div>

                      {/* Interview Connection Line */}
                      {index < 3 && (
                        <motion.div
                          className="absolute top-1/2 left-full w-8 h-0.5 bg-green-500"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Interview Results */}
                <motion.div
                  className="absolute right-8 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-2xl">
                    <div className="text-center">
                      <Zap className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-3xl font-black mb-1">3</div>
                      <div className="text-sm font-semibold">Interviews</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Results */}
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mt-8">
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-4xl font-black text-green-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Applications Sent</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-green-600 mb-1">3</div>
                    <div className="text-sm text-gray-600">Interviews (25%)</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black text-green-600 mb-1">20</div>
                    <div className="text-sm text-gray-600">Hours Invested</div>
                  </div>
                </div>
                <p className="text-center text-green-700 font-semibold mt-4 text-sm">
                  10x more interviews from 10x fewer applications. Quality over quantity.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Auto-switches every 4 seconds • Click to compare instantly</p>
      </div>
    </div>
  )
}
