import React from 'react'

/**
 * Props for ErrorPageLayout component
 */
export interface ErrorPageLayoutProps {
  /** Emoji icon to display */
  icon: string
  
  /** Error title */
  title: string
  
  /** Error message/description */
  message: string
  
  /** Primary action button */
  primaryAction: {
    label: string
    onClick: () => void
    variant?: 'default' | 'fire' | 'warning'
  }
  
  /** Optional secondary actions */
  secondaryActions?: Array<{
    label: string
    onClick: () => void
  }>
  
  /** Optional support info to display */
  showSupport?: boolean
  
  /** Optional custom support message */
  supportMessage?: string
  
  /** Optional additional content */
  children?: React.ReactNode
}

/**
 * Shared layout component for all error pages
 * Provides consistent structure and styling
 */
export const ErrorPageLayout: React.FC<ErrorPageLayoutProps> = ({
  icon,
  title,
  message,
  primaryAction,
  secondaryActions = [],
  showSupport = true,
  supportMessage,
  children
}) => {
  const getButtonStyles = (variant: string = 'default') => {
    switch (variant) {
      case 'fire':
        return 'bg-gradient-to-r from-fire-500 to-ember-600 hover:from-fire-600 hover:to-ember-700'
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600'
      default:
        return 'bg-gray-600 hover:bg-gray-700'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-fire-500 via-fire-600 to-ember-600 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-fire-600 to-ember-600 text-white px-3 py-2.5 shadow-lg">
        <h1 className="text-lg font-bold text-center drop-shadow-md">
          {icon} {title}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            {/* Icon */}
            <div className="text-6xl mb-4">{icon}</div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {title}
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Custom Content */}
            {children && (
              <div className="mb-6">
                {children}
              </div>
            )}

            {/* Primary Action */}
            <button
              onClick={primaryAction.onClick}
              className={`w-full text-white font-bold text-lg py-3 px-4 rounded-lg shadow-lg transform active:scale-95 transition-all ${getButtonStyles(primaryAction.variant)}`}
            >
              {primaryAction.label}
            </button>

            {/* Secondary Actions */}
            {secondaryActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="w-full mt-3 bg-white border-2 border-fire-500 text-fire-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-fire-50 transition-colors"
              >
                {action.label}
              </button>
            ))}

            {/* Support Info */}
            {showSupport && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p className="mb-2">
                    {supportMessage || 'Need help? Contact support:'}
                  </p>
                  <p className="font-semibold text-gray-700">📞 (555) 123-4567</p>
                  <p className="font-semibold text-gray-700">📧 support@restaurant.com</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
