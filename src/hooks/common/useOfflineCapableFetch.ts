
import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define a stricter constraint: TQueryFnData must be assignable to TData
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
  
  const { 
    data: apiData,
    error: apiError,
    isLoading: isApiLoading,
    isError: isApiError,
    refetch,
    ...rest
  } = useQuery<TData, TError, TQueryFnData, TQueryKey>({
    queryKey,
    queryFn: async () => {
      // Call the provided queryFn
      return await queryFn();
    },
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
  });
  
  // Cache erfolgreiche API-Antworten
  useEffect(() => {
    if (apiData && !isUsingLocalStorage) {
      // Since our type definitions specify TQueryFnData as the source type for TData,
      // we can safely cast apiData back to TQueryFnData for storage
      const queryFnData = apiData as unknown as TQueryFnData;
      saveLocalData(queryFnData);
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
