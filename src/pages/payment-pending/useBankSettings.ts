import { useState, useEffect } from 'react'

interface BankSettings {
  bankName: string
  bankAccountNumber: string
  bankAccountHolder: string
  bankTransferInstructions: string
}

export function useBankSettings() {
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/public/bank-transfer')
        if (response.ok) {
          const data = await response.json()
          setBankSettings({
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            bankAccountHolder: data.bankAccountHolder || '',
            bankTransferInstructions: data.bankTransferInstructions || ''
          })
        }
      } catch (err) {
        console.error('Error fetching bank settings:', err)
      }
    }

    fetchSettings()
  }, [])

  return { bankSettings }
}
