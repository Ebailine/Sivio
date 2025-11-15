/**
 * Onboarding Checklist Component
 * Psychology-backed onboarding using Zeigarnik Effect
 * Appears as subtle, non-intrusive progress tracker
 * Follows Notion's learn-by-doing approach
 */

'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: () => void
  href?: string
}

export function OnboardingChecklist() {
  const [isVisible, setIsVisible] = useState(true)
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'browse_jobs',
      title: 'Browse Internships',
      description: 'Explore 50,000+ live internship listings',
      completed: false,
      href: '/jobs',
    },
    {
      id: 'apply_first',
      title: 'Mark Your First Application',
      description: 'Click "Mark as Applied" on any job',
      completed: false,
    },
    {
      id: 'explore_crm',
      title: 'Check Your CRM Dashboard',
      description: 'See your applications organized beautifully',
      completed: false,
      href: '/crm',
    },
    {
      id: 'invite_friends',
      title: 'Invite Your Friends',
      description: 'Help classmates land internships 10x faster',
      completed: false,
    },
  ])

  const completedCount = steps.filter(s => s.completed).length
  const totalSteps = steps.length
  const progressPercent = (completedCount / totalSteps) * 100

  // Check localStorage for completed steps
  useEffect(() => {
    const savedSteps = localStorage.getItem('onboarding_steps')
    if (savedSteps) {
      setSteps(JSON.parse(savedSteps))
    }

    const dismissed = localStorage.getItem('onboarding_dismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  // Save to localStorage when steps change
  useEffect(() => {
    localStorage.setItem('onboarding_steps', JSON.stringify(steps))
  }, [steps])

  const markStepComplete = (stepId: string) => {
    setSteps(steps.map(s =>
      s.id === stepId ? { ...s, completed: true } : s
    ))
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding_dismissed', 'true')
  }

  if (!isVisible || completedCount === totalSteps) return null

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 z-50 animate-slide-up">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Get Started</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Dismiss checklist"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{completedCount} of {totalSteps} completed</span>
            <span className="font-semibold text-blue-600">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border-2 transition-all ${
              step.completed
                ? 'border-green-200 bg-green-50'
                : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold mb-1 ${
                  step.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}>
                  {step.title}
                </h4>
                <p className="text-xs text-gray-600 mb-2">{step.description}</p>
                {!step.completed && step.href && (
                  <Button
                    variant="ghost"
                    size="sm"
                    href={step.href}
                    className="text-xs h-7 px-3"
                    onClick={() => markStepComplete(step.id)}
                  >
                    Go <ArrowRight size={12} className="ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <p className="text-xs text-gray-600 text-center">
          🎓 Join <span className="font-semibold text-blue-600">10,000+ students</span> who landed internships with Sivio
        </p>
      </div>
    </div>
  )
}
