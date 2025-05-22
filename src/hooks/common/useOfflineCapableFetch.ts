
import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions, QueryKey, QueryFunction } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface UseOfflineCapableFetchOptions<TData, TError, TQueryFnData = TData, TQueryKey extends QueryKey = QueryKey> 
  extends Omit<UseQueryOptions<TData, TError, TQueryFnData, TQueryKey>, 'queryKey' | 'queryFn'> {
  queryKey: TQueryKey;
  queryFn: () => Promise<TQueryFnData>;
  loadLocalData: () => TData | null;
  saveLocalData: (data: TQueryFnData) => void;
  onSwitchToOffline?: () => void;
}

export function useOfflineCapableFetch<
  TData = unknown, 
  TError = Error, 
  TQueryFnData = TData, 
  TQueryKey extends QueryKey = QueryKey
>({
  queryKey,
  queryFn,
  loadLocalData,
  saveLocalData,
  onSwitchToOffline,
  ...options
}: UseOfflineCapableFetchOptions<TData, TError, TQueryFnData, TQueryKey>) {
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
    queryFn: async (context) => {
      // This wrapper ensures the return type is correctly typed as TQueryFnData
      const result = await queryFn();
      return result;
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
      // We know apiData is of type TQueryFnData here since it's the return type of queryFn
      saveLocalData(apiData as unknown as TQueryFnData);
    }
  }, [apiData, isUsingLocalStorage, saveLocalData]);
  
  // Endgültige Daten
  const localData = loadLocalData();
  const data = isUsingLocalStorage ? localData : apiData as TData | undefined;
  
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
