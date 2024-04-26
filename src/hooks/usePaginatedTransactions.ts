import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

/* 
Approach taken bug 4: The goal is to ensure that when new data is loaded, it is appended to the existing transactions without replacing them entirely, thus preventing the loss of initial transactions.
 The old code only checked if either the response or previousResponse was null before setting paginatedTransactions, which didn't handle the case where previousResponse is null but response is not null.
 The new code addresses this by explicitly checking if response is null and returning it if so. Then, it checks if previousResponse is null and returns response if so.
   Finally, if both response and previousResponse are not null, it concatenates the data from both responses and sets the nextPage accordingly.
*/

    setPaginatedTransactions((previousResponse) => {
      if (response === null) {
        return response;
      }
    
      if (previousResponse === null) {
        return response;
      }
    
      return {
        data: [...previousResponse.data, ...response.data],
        nextPage: response.nextPage,
      };
    });
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
