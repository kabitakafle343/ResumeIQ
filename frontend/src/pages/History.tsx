import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { deleteResumeHistory, type ResumeHistoryItem } from '../api/query'
import { useResumeHistory } from '../context/useResumeHistory'

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const shortTitle = (title: string) => title.replace(/\.pdf$/i, '')

const History = () => {
  const { history, isHistoryLoading, refreshHistory } = useResumeHistory()
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null)
  const [comparisonIds, setComparisonIds] = useState<string[] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pageError, setPageError] = useState('')

  const defaultSelection = history.slice(-2).map((item) => item.id)
  const activeSelection = selectedIds ?? defaultSelection
  const activeComparison = comparisonIds ?? activeSelection
  const comparison = history.filter((item) => activeComparison.includes(item.id))
  const orderedHistory = [...history].reverse()

  const handleSelection = (id: string, isChecked: boolean) => {
    const currentSelection = activeSelection
    if (isChecked && currentSelection.length >= 2) {
      setPageError('Choose up to two analyses to compare.')
      return
    }

    setSelectedIds(isChecked
      ? [...currentSelection, id]
      : currentSelection.filter((selectedId) => selectedId !== id))
    setComparisonIds(null)
    setPageError('')
  }

  const handleDelete = async (item: ResumeHistoryItem) => {
    if (!window.confirm(`Delete ${item.title}? This cannot be undone.`)) return

    setDeletingId(item.id)
    setPageError('')
    try {
      await deleteResumeHistory(item.id)
      setSelectedIds((current) => (current ?? defaultSelection).filter((id) => id !== item.id))
      setComparisonIds(null)
      await refreshHistory()
    } catch {
      setPageError(`Unable to delete ${item.title}. Please try again.`)
    } finally {
      setDeletingId(null)
    }
  }

  const olderAnalysis = comparison.length === 2 ? comparison[0] : null
  const newerAnalysis = comparison.length === 2 ? comparison[1] : null
  const scoreDifference = olderAnalysis && newerAnalysis
    ? newerAnalysis.score - olderAnalysis.score
    : 0
  const fixedWeaknesses = olderAnalysis && newerAnalysis
    ? olderAnalysis.weaknesses.filter((weakness) =>
      !newerAnalysis.weaknesses.some((item) => item.toLowerCase() === weakness.toLowerCase()))
    : []
  const addedStrengths = olderAnalysis && newerAnalysis
    ? newerAnalysis.strengths.filter((strength) =>
      !olderAnalysis.strengths.some((item) => item.toLowerCase() === strength.toLowerCase()))
    : []

  return (
    <Stack maxW="1120px" mx="auto" spacing={{ base: 4, md: 5 }}>
      <Flex align={{ base: 'flex-start', sm: 'center' }} justify="space-between" gap={4}>
        <Box>
          <Heading as="h1" color="#21372d" fontFamily="Georgia, 'Times New Roman', serif" fontSize={{ base: '29px', md: '34px' }} fontWeight="400" lineHeight="1.15">
            Past analyses
          </Heading>
          <Text mt={2} color="#526158" fontSize="14px">
            Select two versions to compare your progress.
          </Text>
        </Box>
        <Flex flexShrink={0} align="center" px={3} py={2} border="1px solid #d9e1d5" borderRadius="6px" bg="white" color="#34463a" fontSize="12px" fontWeight="650">
          {history.length} {history.length === 1 ? 'analysis' : 'analyses'}
        </Flex>
      </Flex>

      <Stack spacing={0} px={{ base: 3, md: 4 }} border="1px solid #d9e1d5" borderRadius="10px" bg="white">
        <Flex align="center" justify="space-between" gap={3} py={3} borderBottom="1px solid #e7ece3">
          <Text color="#526158" fontSize="11px" fontWeight="700" letterSpacing="0.5px">YOUR RESUMES</Text>
          <Text color="#718078" fontSize="11px" fontWeight="600">
            {activeSelection.length}/2 selected
          </Text>
        </Flex>
        {orderedHistory.map((item) => {
          const historyIndex = history.findIndex((entry) => entry.id === item.id)
          const scoreChange = historyIndex > 0 ? item.score - history[historyIndex - 1].score : null

          return (
            <Flex key={item.id} align="center" gap={{ base: 2, sm: 3 }} minH="68px" py={2} px={2} mx={-2} borderBottom="1px solid #e7ece3" bg={activeSelection.includes(item.id) ? '#f7f9f4' : 'white'} transition="background 120ms ease" _last={{ borderBottom: 'none' }}>
              <Checkbox
                flexShrink={0}
                colorScheme="green"
                isChecked={activeSelection.includes(item.id)}
                onChange={(event) => handleSelection(item.id, event.target.checked)}
                aria-label={`Select ${item.title} for comparison`}
              />
              <Box flex="1" minW="0">
                <Text overflow="hidden" color="#25372f" fontSize="14px" fontWeight="600" textOverflow="ellipsis" whiteSpace="nowrap" title={item.title}>
                  {item.title}
                </Text>
                <Text mt="2px" color="#526158" fontSize="11px">
                  {formatDate(item.date)}
                </Text>
              </Box>
              {scoreChange !== null && (
                <Flex flexShrink={0} align="center" justify="center" minW="38px" h="22px" px={2} borderRadius="full" bg={scoreChange >= 0 ? '#e4f1c8' : '#f7e4dc'} color={scoreChange >= 0 ? '#49652f' : '#a44c37'} fontSize="11px" fontWeight="700">
                  {scoreChange > 0 ? '+' : ''}{scoreChange}
                </Flex>
              )}
              <Text minW="34px" color="#17372c" fontFamily="Georgia, 'Times New Roman', serif" fontSize="22px" fontWeight="700" textAlign="right">
                {item.score}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                minW="auto"
                px={2}
                color="#c44f3f"
                fontSize="12px"
                fontWeight="600"
                aria-label={`Delete ${item.title}`}
                isLoading={deletingId === item.id}
                onClick={() => void handleDelete(item)}
                _hover={{ bg: '#fff1ed', color: '#a83d30' }}
              >
                Delete
              </Button>
            </Flex>
          )
        })}
        {!isHistoryLoading && history.length === 0 && (
          <Text py={7} color="#738078" fontSize="13px" textAlign="center">
            No analyses yet. Upload a resume to start your history.
          </Text>
        )}
        {isHistoryLoading && history.length === 0 && (
          <Text py={7} color="#738078" fontSize="13px" textAlign="center">
            Loading analyses…
          </Text>
        )}
      </Stack>

      <Flex align={{ base: 'stretch', sm: 'center' }} justify="space-between" direction={{ base: 'column', sm: 'row' }} gap={3}>
        <Text color={pageError ? '#b44f3b' : '#526158'} fontSize="12px" role={pageError ? 'alert' : undefined}>
          {pageError || (activeSelection.length === 2 ? 'Two analyses selected' : 'Select two analyses to compare')}
        </Text>
        <Button
          alignSelf={{ base: 'flex-start', sm: 'auto' }}
          size="md"
          h="42px"
          px={5}
          bg="#234136"
          color="white"
          fontSize="12px"
          isDisabled={activeSelection.length !== 2}
          onClick={() => setComparisonIds(activeSelection)}
          _hover={{ bg: '#315743' }}
          _disabled={{ bg: '#edf0eb', color: '#9ba49c', cursor: 'not-allowed' }}
        >
          Compare selected
        </Button>
      </Flex>

      <Stack spacing={4} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="10px" bg="white">
        {olderAnalysis && newerAnalysis ? (
          <>
            <Text color="#526158" fontSize="11px" fontWeight="700" letterSpacing="0.5px">
              COMPARE {shortTitle(olderAnalysis.title)} AND {shortTitle(newerAnalysis.title)}
            </Text>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
              <Stack spacing={2} minH="130px" p={4} borderRadius="8px" bg="#f1f3ed">
                <Text color="#526158" fontSize="12px" fontWeight="600">{shortTitle(olderAnalysis.title)}</Text>
                <Text color="#18392e" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30px" lineHeight="1">{olderAnalysis.score}</Text>
                <Text color="#91432f" fontSize="12px" lineHeight="1.55">
                  {olderAnalysis.weaknesses.length > 0
                    ? `${olderAnalysis.weaknesses.length} issues: ${olderAnalysis.weaknesses.slice(0, 2).join(', ')}`
                    : 'No flagged issues'}
                </Text>
              </Stack>
              <Stack spacing={2} minH="130px" p={4} borderRadius="8px" bg="#e4f1c8">
                <Text color="#526b40" fontSize="12px" fontWeight="600">{shortTitle(newerAnalysis.title)}</Text>
                <HStack align="baseline" spacing={2}>
                  <Text color="#18392e" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30px" lineHeight="1">{newerAnalysis.score}</Text>
                  <Text color={scoreDifference >= 0 ? '#526b40' : '#91432f'} fontSize="12px" fontWeight="700">
                    {scoreDifference > 0 ? '+' : ''}{scoreDifference}
                  </Text>
                </HStack>
                <Text color="#405a32" fontSize="12px" fontWeight="550" lineHeight="1.55">
                  {fixedWeaknesses.length} issues fixed, {addedStrengths.length} new {addedStrengths.length === 1 ? 'strength' : 'strengths'}
                </Text>
              </Stack>
            </Grid>
          </>
        ) : (
          <VStack align="flex-start" spacing={1} py={2}>
            <Text color="#263a30" fontSize="14px" fontWeight="650">Compare your progress</Text>
            <Text color="#526158" fontSize="12px" lineHeight="1.6">
              Select two analyses above to compare scores, strengths, and areas to improve.
            </Text>
          </VStack>
        )}
      </Stack>
    </Stack>
  )
}

export default History