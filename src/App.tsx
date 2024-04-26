import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    await paginatedTransactionsUtils.fetchAll()

    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            else if (newValue.id === "") {
              await loadAllTransactions()
            }
            else await loadTransactionsByEmployee(newValue.id)
          }}
        />
  {/*
  APPROACH TAKEN TO SOLVE BUG 3
  Conditional rendering is used to dynamically display either a 
  loading message or transaction data based on the value of 'transactions'. 
  If 'transactions' is null, a loading message is displayed; otherwise,
  transactions are rendered along with a "View More" button.
  The button is disabled under certain conditions to prevent user
  interaction during loading or when there are no more transactions to load.
  This approach ensures that the page doesn't crash when attempting to select the "All Employees" option after selecting an employee.
*/}
{/*
  Approach taken BUG 6:
  Part 1:
  The goal is to hide the "View More" button when transactions are filtered by employee, as this is not a paginated request.
  In the old code, the "View More" button was always visible if transactions were not null, regardless of whether they were filtered by employee or not.
  The new code introduces conditional rendering based on the presence of transactions and whether they are filtered by employee. If transactions are null or filtered by employee, the "View More" button is not rendered.

  Part 2:
  The goal is to ensure that the "View More" button disappears when all data has been loaded, preventing the user from clicking it and causing the page to crash.
  In the old code, the "View More" button was always visible if transactions were not null, even if all data had been loaded.
  The new code adds additional conditions to disable the button when all data has been loaded, ensuring that it is not clickable and preventing the page from crashing.
*/}

              <div className="RampBreak--l" />

        <div className="RampGrid">
          {transactions === null ? (
            <div className="RampLoading--container">Loading...</div>
          ) : (
            <Fragment>
              <div data-testid="transaction-container">
                {transactions.map((transaction) => (
                  <Transactions key={transaction.id} transactions={[transaction]} />
                ))}
              </div>
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading || paginatedTransactions?.nextPage == null || transactionsByEmployee?.length === 0}
                onClick={async () => {
                  await loadAllTransactions()
                }}
              >
                View More
              </button>
            </Fragment>
          )}
        </div>
      </main>
    </Fragment>
  )
}
