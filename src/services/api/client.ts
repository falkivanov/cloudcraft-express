/**
 * API-Client für die Kommunikation mit dem FastAPI-Backend
 */

import { API_BASE_URL, API_TIMEOUT } from './config';
import { ApiResponse } from './types';

/**
 * Standardoptionen für fetch-Anfragen
 */
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  credentials: 'include', // Für Cookie-basierte Authentifizierung
};

/**
 * Grundlegende Fetch-Funktion mit Timeout und Fehlerbehandlung
 */
async function fetchWithTimeout<T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    console.log(`API request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Einfache Text-Antworten oder keine Inhalte
    if (response.status === 204) {
      return { success: true };
    }
    
    // JSON-Antworten
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.detail || data.message || `Error: ${response.status}` 
        };
      }
      
      return { success: true, data };
    }
    
    // Nicht-JSON-Antworten
    if (!response.ok) {
      const text = await response.text();
      return { 
        success: false, 
        error: text || `Server responded with status ${response.status}`
      };
    }
    
    // Generisches Erfolgsergebnis für nicht-JSON-Antworten
    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error(`API request failed: ${url}`, error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Die Anfrage hat das Zeitlimit überschritten.' };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        return { 
          success: false, 
          error: 'Keine Verbindung zum Server möglich. Bitte überprüfen Sie Ihre Internetverbindung oder ob der Server läuft.' 
        };
      }
      
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Ein unbekannter Fehler ist aufgetreten.' };
  }
}

/**
 * GET-Anfrage an die API
 */
export async function get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE_URL}${path}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }
  
  return fetchWithTimeout<T>(url.toString(), { method: 'GET' });
}

/**
 * POST-Anfrage an die API
 */
export async function post<T>(path: string, body?: any): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const options: RequestInit = {
    method: 'POST',
  };
  
  if (body) {
    if (body instanceof FormData) {
      // FormData für Datei-Uploads
      options.body = body;
      // Bei FormData sollten wir den Content-Type Header entfernen
      options.headers = { ...defaultOptions.headers };
      delete (options.headers as any)['Content-Type'];
    } else {
      // JSON-Daten
      options.body = JSON.stringify(body);
    }
  }
  
  return fetchWithTimeout<T>(url, options);
}

/**
 * PUT-Anfrage an die API
 */
export async function put<T>(path: string, body?: any): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const options: RequestInit = {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined
  };
  
  return fetchWithTimeout<T>(url, options);
}

/**
 * DELETE-Anfrage an die API
 */
export async function del<T>(path: string): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  return fetchWithTimeout<T>(url, { method: 'DELETE' });
}

/**
 * Datei-Upload an die API
 */
export async function uploadFile<T>(
  path: string, 
  file: File, 
  additionalFields?: Record<string, string>
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${path}`;
  const formData = new FormData();
  
  formData.append('file', file);
  
  if (additionalFields) {
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return fetchWithTimeout<T>(url, {
    method: 'POST',
    body: formData
  });
}

/**
 * Prüft, ob die API erreichbar ist
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await get('/health');
    return response.success;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
