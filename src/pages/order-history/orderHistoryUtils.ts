export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳'
    case 'confirmed':
      return '✅'
    case 'preparing':
      return '👨‍🍳'
    case 'ready':
      return '🔔'
    case 'delivered':
      return '🎉'
    case 'cancelled':
      return '❌'
    default:
      return '📋'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-50'
    case 'confirmed':
      return 'text-blue-600 bg-blue-50'
    case 'preparing':
      return 'text-orange-600 bg-orange-50'
    case 'ready':
      return 'text-green-600 bg-green-50'
    case 'delivered':
      return 'text-purple-600 bg-purple-50'
    case 'cancelled':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function formatOrderDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString()
}

export function formatOrderTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString()
}
