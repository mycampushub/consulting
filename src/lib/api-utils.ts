import { useState, useEffect } from 'react'

// Generic API hook for data fetching
export function useApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
    immediate?: boolean
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (customUrl?: string, customOptions?: typeof options) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(customUrl || url, {
        method: customOptions?.method || options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...customOptions?.headers,
        },
        body: customOptions?.body || options.body ? JSON.stringify(customOptions?.body || options.body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, [url])

  return { data, loading, error, refetch: fetchData, setData }
}

// Hook for subdomain-based API calls
export function useSubdomainApi<T>(
  subdomain: string,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
    immediate?: boolean
  } = {}
) {
  const url = `/api/${subdomain}${endpoint}`
  return useApi<T>(url, options)
}

// Hook for real-time data with polling
export function useRealTimeApi<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
    pollInterval?: number
  } = {}
) {
  const { data, loading, error, refetch } = useApi<T>(url, { ...options, immediate: false })
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  const startPolling = (interval = options.pollInterval || 30000) => {
    if (pollInterval) {
      clearInterval(pollInterval)
    }
    
    const interval = setInterval(() => {
      refetch()
    }, interval)
    
    setPollInterval(interval)
  }

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval)
      setPollInterval(null)
    }
  }

  useEffect(() => {
    if (options.immediate !== false) {
      refetch()
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [url])

  return { data, loading, error, refetch, startPolling, stopPolling }
}

// Hook for subdomain real-time data
export function useSubdomainRealTimeApi<T>(
  subdomain: string,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
    pollInterval?: number
  } = {}
) {
  const url = `/api/${subdomain}${endpoint}`
  return useRealTimeApi<T>(url, options)
}

// Utility function for API calls with proper error handling
export async function apiCall<T>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

// Subdomain API call utility
export async function subdomainApiCall<T>(
  subdomain: string,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: any
    headers?: Record<string, string>
  } = {}
): Promise<T> {
  const url = `/api/${subdomain}${endpoint}`
  return apiCall<T>(url, options)
}