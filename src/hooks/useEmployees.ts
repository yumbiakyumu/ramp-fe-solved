import { useCallback, useState } from "react"
import { Employee } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"
import { EmployeeResult } from "./types"


export function useEmployees(): EmployeeResult {
  const { fetchWithCache } = useCustomFetch()
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [loadingEmployees, setLoadingEmployees] = useState(false) // New state for loading employees

  const fetchAll = useCallback(async () => {
    setLoadingEmployees(true) // Set loading state before fetching
    const employeesData = await fetchWithCache<Employee[]>("employees")
    setEmployees(employeesData)
    setLoadingEmployees(false) // Reset loading state after fetching
  }, [fetchWithCache])

  const invalidateData = useCallback(() => {
    setEmployees(null)
  }, [])

  return { data: employees, loading: loadingEmployees, fetchAll, invalidateData } // Return loadingEmployees instead of loading
}
