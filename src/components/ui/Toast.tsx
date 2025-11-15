import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  }

  const variant = variants[type]

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 ${variant.bg} ${variant.border} ${variant.text} px-4 py-3 rounded-xl shadow-lg border-2 min-w-[300px] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300`}
    >
      {variant.icon}
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Toast Container for stacking multiple toasts
export interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(-${index * 8}px)` }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}
