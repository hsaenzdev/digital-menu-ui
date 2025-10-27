import { useState, useEffect } from 'react'

export interface BankSettings {
  bankTransferEnabled: boolean
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  bankTransferInstructions: string
}

export function useBankSettings() {
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/public/bank-transfer')
        if (response.ok) {
          const data = await response.json()
          setBankSettings({
            bankTransferEnabled: data.bankTransferEnabled ?? false,
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankAccountHolder: data.bankAccountHolder || '',
            bankTransferInstructions: data.bankTransferInstructions || ''
          })
        }
      } catch {
        // Use defaults if fetch fails
        setBankSettings({
          bankTransferEnabled: false,
          bankName: '',
          bankAccountNumber: '',
          bankAccountHolder: '',
          bankTransferInstructions: ''
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  return { bankSettings, loading }
}
