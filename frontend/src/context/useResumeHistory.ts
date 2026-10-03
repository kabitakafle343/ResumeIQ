import { useContext } from 'react'
import { ResumeHistoryContext } from './resumeHistoryStore'

export const useResumeHistory = () => {
  const context = useContext(ResumeHistoryContext)
  if (!context) throw new Error('useResumeHistory must be used within ResumeHistoryProvider')
  return context
}