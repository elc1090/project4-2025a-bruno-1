import React, { createContext, useState, useContext } from 'react'

const LoadingContext = createContext({ isLoading: false, setIsLoading: () => {} })

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}