import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-3 pr-10 border-2 rounded-xl transition-all outline-none appearance-none ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            } ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
