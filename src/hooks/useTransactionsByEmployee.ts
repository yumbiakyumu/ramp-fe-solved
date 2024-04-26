import { useEffect, useCallback, useState } from "react"
import { RequestByEmployeeParams, Transaction } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"
/*
Bug7 Fix:

The bug occurred because transaction approval status wasn't persisting when switching between employees or selecting "All Employees". 

The fix introduces a new state variable 'approvalChanges' to track user-made approval status changes. This state is stored in local storage for persistence across different employee selections.

On component mount, 'approvalChanges' is loaded from local storage. If any saved changes exist, the state is updated with these changes.

A 'useEffect' hook listens for 'approvalChanges' state changes. When it changes, the new state is saved to local storage, preserving user changes for future visits.

In the 'fetchById' function, 'approvalChanges' is applied to the fetched transactions. For each transaction, if an approval change exists in 'approvalChanges', that value is used. Otherwise, the approval status from the fetched data is used. This ensures user changes are reflected in the UI, even when switching between different employees or selecting "All Employees".
*/

export function useTransactionsByEmployee() {
  const { fetchWithCache, loading } = useCustomFetch()
  const [transactionsByEmployee, setTransactionsByEmployee] = useState<Transaction[] | null>(null)
  const [approvalChanges, setApprovalChanges] = useState<Record<string, boolean>>({})

  // Load approvalChanges from local storage when the component is mounted
  useEffect(() => {
    const savedApprovalChanges = localStorage.getItem('approvalChanges')
    if (savedApprovalChanges) {
      setApprovalChanges(JSON.parse(savedApprovalChanges))
    }
  }, [])

  // Save approvalChanges to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('approvalChanges', JSON.stringify(approvalChanges))
  }, [approvalChanges])

  const fetchById = useCallback(
    async (employeeId: string) => {
      const data = await fetchWithCache<Transaction[], RequestByEmployeeParams>(
        "transactionsByEmployee",
        {
          employeeId,
        }
      )

      if (data) { // Check if data is not null
        // Apply approval changes to fetched transactions
        const updatedTransactions = data.map(transaction => ({
          ...transaction,
          approved: approvalChanges[transaction.id] ?? transaction.approved,
        }))

        setTransactionsByEmployee(updatedTransactions)
      }
    },
    [fetchWithCache, approvalChanges]
  )

  const invalidateData = useCallback(() => {
    setTransactionsByEmployee(null)
  }, [])

  const toggleApproval = useCallback(async (transactionId: string) => {
    // Calculate the new approval status
    const newApprovalStatus = !approvalChanges[transactionId]

    // Update the approval status in the local state
    setApprovalChanges(prev => ({
      ...prev,
      [transactionId]: newApprovalStatus,
    }))

    // Send a request to the server to update the approval status
    await fetch(`/api/transactions/${transactionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approved: newApprovalStatus,
      }),
    })
  }, [approvalChanges])

  return { data: transactionsByEmployee, loading, fetchById, invalidateData, toggleApproval }
}
