import { useState, useEffect } from 'react'
import type { MenuItem, ApiResponse } from '../../types'

export function useMenuItems(categoryId: string) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!categoryId) {
      setItems([])
      return
    }

    const fetchCategoryItems = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`/api/menu/categories/${categoryId}/items`)
        const data: ApiResponse<MenuItem[]> = await response.json()

        if (data.success && data.data) {
          setItems(data.data)
        } else {
          setError('Failed to load menu items')
          setItems([])
        }
      } catch {
        setError('Failed to load menu items')
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryItems()
  }, [categoryId])

  return {
    items,
    loading,
    error
  }
}
