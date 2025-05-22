
import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions, QueryKey, QueryFunction } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define our options interface
export interface UseOfflineCapableFetchOptions<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> extends Omit<UseQueryOptions<TData, TError, TQueryFnData, TQueryKey>, 'queryKey' | 'queryFn'> {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
  loadLocalData: () => TData | null;
  saveLocalData: (data: TQueryFnData) => void;
  onSwitchToOffline?: () => void;
}

export function useOfflineCapableFetch<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>({
  queryKey,
  queryFn,
  loadLocalData,
  saveLocalData,
  onSwitchToOffline,
  ...options
}: UseOfflineCapableFetchOptions<TQueryFnData, TError, TData, TQueryKey>) {
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState<boolean>(false);
  
  // Create a properly typed query function
  const typedQueryFn: QueryFunction<TQueryFnData, TQueryKey> = async () => {
    return await queryFn();
  };
  
  // Build query options with proper types
  const queryOptions: UseQueryOptions<TData, TError, TQueryFnData, TQueryKey> = {
    queryKey,
    queryFn: typedQueryFn,
    retry: false,
    meta: {
      onSettled: (data, err) => {
        if (err) {
          console.error(`API-Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
          setIsUsingLocalStorage(true);
          toast('Verbindungsproblem', {
            description: 'Fallback auf lokale Daten aktiviert.'
          });
          
          if (onSwitchToOffline) {
            onSwitchToOffline();
          }
        }
      }
    },
    ...options
  };

  // Use the query with the properly typed options
  const { 
    data: apiData,
    error: apiError,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch,
    ...rest
  } = useQuery<TData, TError, TQueryFnData, TQueryKey>(queryOptions);
  
  // Cache erfolgreiche API-Antworten
  useEffect(() => {
    if (apiData && !isUsingLocalStorage) {
      // We need to cast apiData to TQueryFnData for storage
      saveLocalData(apiData as unknown as TQueryFnData);
    }
  }, [apiData, isUsingLocalStorage, saveLocalData]);
  
  // Endgültige Daten
  const localData = loadLocalData();
  const data = isUsingLocalStorage ? localData : apiData;
  
  // Status zusammenfassen
  const isLoading = isApiLoading && !isUsingLocalStorage;
  const isError = (isApiError || !data) && isUsingLocalStorage;
  
  // Zurück zur API wechseln
  const switchBackToApi = () => {
    setIsUsingLocalStorage(false);
    refetch();
  };
  
  return {
    data,
    isLoading,
    isError,
    isUsingLocalStorage,
    switchBackToApi,
    refetch,
    ...rest
  };
}
