import { useCallback, useState } from "react"
import { Employee } from "../utils/types"
import { useCustomFetch } from "./useCustomFetch"
import { EmployeeResult } from "./types"

// bug 5 fix Approach taken:
// Part 1:
// The goal is to ensure that the employee filter stops showing "Loading employees.." as soon as the request for employees is succeeded, even if other data is still loading.
// In the old code, there was no separate loading state for employees, so the loading state was tied to the overall loading state, which caused the issue.
// The new code introduces a separate loading state, employeesLoading, to track the loading state specifically for employees.

// Part 2:
// Additionally, when new transactions are loaded, the employee filter should not show "Loading employees..." again, as employees are already loaded.
// To address this, the new code ensures that the loading state for employees is set to true before fetching new employees data when the "View more" button is clicked,
// and it sets the loading state to false after fetching, ensuring that the filter does not show "Loading employees..." again unnecessarily.


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
