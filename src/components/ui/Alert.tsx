import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export interface AlertProps {
  title?: string
  children: React.ReactNode
  variant?: 'success' | 'error' | 'warning' | 'info'
  onClose?: () => void
  actions?: React.ReactNode
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  onClose,
  actions,
  className = '',
}) => {
  const variants = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      titleText: 'text-green-900',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      titleText: 'text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      titleText: 'text-orange-900',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      titleText: 'text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  }

  const style = variants[variant]

  return (
    <div
      className={`${style.bg} ${style.border} border-2 rounded-xl p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1">
          {title && (
            <h3 className={`font-bold text-sm mb-1 ${style.titleText}`}>{title}</h3>
          )}
          <div className={`text-sm ${style.text}`}>{children}</div>
          {actions && <div className="mt-3 flex items-center gap-2">{actions}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 hover:opacity-70 transition-opacity ${style.text}`}
            aria-label="Close alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
