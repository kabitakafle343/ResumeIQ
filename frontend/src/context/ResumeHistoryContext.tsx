import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { getResumeHistory, type ResumeHistoryData, type ResumeHistoryItem } from '../api/query'
import { ResumeHistoryContext } from './resumeHistoryStore'

export const ResumeHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<ResumeHistoryItem[]>([])
  const [historyData, setHistoryData] = useState<ResumeHistoryData | null>(null)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)

  const refreshHistory = useCallback(async () => {
    try {
      const response = await getResumeHistory()
      setHistoryData(response)
      setHistory(response.history)
    } catch {
      setHistoryData(null)
      setHistory([])
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive = true
    const loadInitialHistory = async () => {
      try {
        const response = await getResumeHistory()
        if (isActive) {
          setHistoryData(response)
          setHistory(response.history)
        }
      } catch {
        if (isActive) {
          setHistoryData(null)
          setHistory([])
        }
      } finally {
        if (isActive) setIsHistoryLoading(false)
      }
    }

    void loadInitialHistory()
    return () => {
      isActive = false
    }
  }, [])

  return (
    <ResumeHistoryContext.Provider value={{ history, historyData, isHistoryLoading, refreshHistory }}>
      {children}
    </ResumeHistoryContext.Provider>
  )
}