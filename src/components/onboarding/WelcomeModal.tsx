/**
 * Welcome Modal Component
 * Personalized onboarding following Notion's approach
 * Non-intrusive, skippable, helps segment users
 * Uses progressive disclosure - one question at a time
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Target, Brain, Rocket, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GradientText } from '@/components/ui/GradientText'

interface UserGoal {
  id: string
  icon: JSX.Element
  title: string
  description: string
  color: string
}

export function WelcomeModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const goals: UserGoal[] = [
    {
      id: 'urgent',
      icon: <Rocket className="w-8 h-8" />,
      title: 'Find internship ASAP',
      description: 'I need an internship for this summer/semester',
      color: 'from-red-500 to-orange-500',
    },
    {
      id: 'exploring',
      icon: <Target className="w-8 h-8" />,
      title: 'Exploring options',
      description: 'I want to see what\'s out there',
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 'strategic',
      icon: <Brain className="w-8 h-8" />,
      title: 'Planning ahead',
      description: 'I\'m preparing for next year',
      color: 'from-green-500 to-teal-500',
    },
  ]

  useEffect(() => {
    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome')
    const userGoal = localStorage.getItem('user_goal')

    // Only show if first visit and not signed in yet
    if (!hasSeenWelcome && !userGoal) {
      // Delay showing modal slightly for better UX
      setTimeout(() => {
        setIsVisible(true)
      }, 1000)
    }
  }, [])

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoal(goalId)
    localStorage.setItem('user_goal', goalId)
    localStorage.setItem('has_seen_welcome', 'true')

    // Close modal and let user explore
    setTimeout(() => {
      setIsVisible(false)
    }, 500)
  }

  const handleSkip = () => {
    localStorage.setItem('has_seen_welcome', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-6 animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white/50"
              aria-label="Skip welcome"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                Welcome to <GradientText>Sivio</GradientText>
              </h2>
              <p className="text-lg text-gray-600 max-w-lg mx-auto">
                Let's personalize your experience. What brings you here today?
              </p>
            </div>
          </div>

          {/* Goal Selection */}
          <div className="p-8">
            <div className="grid gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleSelectGoal(goal.id)}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-left group ${
                    selectedGoal === goal.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-white shadow-md`}>
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            {/* Skip Button */}
            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
              >
                I'll explore on my own
              </button>
            </div>
          </div>

          {/* Footer with social proof */}
          <div className="px-8 pb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-700">
                🎓 <span className="font-semibold">10,000+ students</span> from Stanford, MIT, Berkeley & more landed internships with Sivio
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
