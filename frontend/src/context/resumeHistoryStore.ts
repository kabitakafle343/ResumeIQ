import { createContext } from 'react'
import type { ResumeHistoryData, ResumeHistoryItem } from '../api/query'

export type ResumeHistoryContextValue = {
  history: ResumeHistoryItem[]
  historyData: ResumeHistoryData | null
  isHistoryLoading: boolean
  refreshHistory: () => Promise<void>
}

export const ResumeHistoryContext = createContext<ResumeHistoryContextValue | null>(null)