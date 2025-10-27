import { useState, useEffect } from 'react'
import type { MenuCategory, ApiResponse } from '../../types'

export function useMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories')
        const data: ApiResponse<MenuCategory[]> = await response.json()

        if (data.success && data.data) {
          setCategories(data.data)
          // Auto-select first category
          if (data.data.length > 0 && !selectedCategory) {
            setSelectedCategory(data.data[0].id)
          }
        } else {
          setError('Failed to load categories')
        }
      } catch {
        setError('Failed to load menu categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [selectedCategory])

  const getCategoryById = (id: string) => categories.find(c => c.id === id)

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    getCategoryById,
    loading,
    error
  }
}
