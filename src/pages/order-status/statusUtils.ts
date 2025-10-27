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

export function getStatusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Your order has been received and is being reviewed.'
    case 'confirmed':
      return 'Your order has been confirmed and will be prepared shortly.'
    case 'preparing':
      return 'Our kitchen is preparing your delicious order!'
    case 'ready':
      return 'Your order is ready for pickup or delivery!'
    case 'delivered':
      return 'Your order has been delivered. Enjoy your meal!'
    case 'cancelled':
      return 'Your order has been cancelled.'
    default:
      return 'Status unknown'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return '#ffc107'
    case 'confirmed':
      return '#17a2b8'
    case 'preparing':
      return '#fd7e14'
    case 'ready':
      return '#28a745'
    case 'delivered':
      return '#6f42c1'
    case 'cancelled':
      return '#dc3545'
    default:
      return '#6c757d'
  }
}

export function isStatusActive(status: string, targetStatuses: string[]): boolean {
  return targetStatuses.includes(status)
}
