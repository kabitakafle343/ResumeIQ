import { useEffect, useState, type FormEvent } from 'react'
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
  Textarea,
} from '@chakra-ui/react'
import { matchResumeToJob, type ResumeJobMatch } from '../api/query'
import TokenService from '../api/tokenservice'
import { useResumeHistory } from '../context/useResumeHistory'

interface SavedComparison {
  resumeId: string
  jobDescription: string
  result: ResumeJobMatch | null
  completedRecommendationIndices: number[]
}

const emptyComparison: SavedComparison = {
  resumeId: '',
  jobDescription: '',
  result: null,
  completedRecommendationIndices: [],
}

const getStorageKey = () => {
  try {
    const userId = TokenService.getTokenDetails()?.userId
    return userId ? `resumeiq.jobMatch.${userId}` : null
  } catch {
    return null
  }
}

const restoreComparison = (storageKey: string | null): SavedComparison => {
  if (!storageKey) return emptyComparison

  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return emptyComparison

    const parsed = JSON.parse(saved) as Partial<SavedComparison>
    return {
      resumeId: typeof parsed.resumeId === 'string' ? parsed.resumeId : '',
      jobDescription: typeof parsed.jobDescription === 'string' ? parsed.jobDescription : '',
      result: parsed.result && typeof parsed.result.matchScore === 'number'
        ? parsed.result as ResumeJobMatch
        : null,
      completedRecommendationIndices: Array.isArray(parsed.completedRecommendationIndices)
        ? parsed.completedRecommendationIndices.filter((index): index is number => Number.isInteger(index))
        : [],
    }
  } catch {
    return emptyComparison
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

const JobMatch = () => {
  const { history, isHistoryLoading } = useResumeHistory()
  const [storageKey] = useState(getStorageKey)
  const [comparison, setComparison] = useState(() => restoreComparison(storageKey))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const { resumeId, jobDescription, result } = comparison
  const descriptionLength = jobDescription.trim().length
  const canSubmit = Boolean(resumeId) && descriptionLength >= 50
  const setupProgress = (Number(Boolean(resumeId)) + Number(descriptionLength >= 50)) * 50
  const completedActions = comparison.completedRecommendationIndices.length

  useEffect(() => {
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(comparison))
    } catch (storageError) {
      console.error('Unable to save the job match on this device', storageError)
    }
  }, [comparison, storageKey])

  const updateInputs = (updates: Partial<SavedComparison>) => {
    setComparison((current) => ({
      ...current,
      ...updates,
      result: null,
      completedRecommendationIndices: [],
    }))
    setCopyStatus('')
  }

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText()
      if (!clipboardText.trim()) {
        setError('Your clipboard is empty.')
        return
      }
      updateInputs({ jobDescription: clipboardText })
      setError('')
    } catch {
      setError('Clipboard access is unavailable. Paste directly into the job description field.')
    }
  }

  const handleCopyPlan = async () => {
    if (!result) return
    const plan = result.recommendations
      .map((recommendation, index) => `${index + 1}. ${recommendation.action}${recommendation.reason ? `\n   ${recommendation.reason}` : ''}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(plan)
      setCopyStatus('Action plan copied')
    } catch {
      setCopyStatus('Unable to copy action plan')
    }
  }

  const toggleRecommendation = (index: number, isChecked: boolean) => {
    setComparison((current) => ({
      ...current,
      completedRecommendationIndices: isChecked
        ? [...current.completedRecommendationIndices, index]
        : current.completedRecommendationIndices.filter((item) => item !== index),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError('')
    setCopyStatus('')
    setComparison((current) => ({ ...current, result: null, completedRecommendationIndices: [] }))
    try {
      const assessment = await matchResumeToJob(resumeId, jobDescription.trim())
      setComparison((current) => ({
        ...current,
        result: assessment,
        completedRecommendationIndices: [],
      }))
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } })
        .response?.data?.message
      setError(message || 'Unable to match this resume. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack maxW="1120px" mx="auto" spacing={{ base: 4, md: 5 }}>
in that      <Flex align={{ base: 'flex-start', sm: 'center' }} justify="space-between" gap={4}>
        <Box>
          <Heading as="h1" color="#21372d" fontFamily="Georgia, 'Times New Roman', serif" fontSize={{ base: '29px', md: '34px' }} fontWeight="400" lineHeight="1.15">
            Match a job
          </Heading>
          <Text mt={2} color="#526158" fontSize="14px">
            Turn a job description into a focused application plan.
          </Text>
        </Box>
        <Flex flexShrink={0} align="center" gap={2} px={3} py={2} border="1px solid" borderColor={canSubmit ? '#c9d8b8' : '#d9e1d5'} borderRadius="6px" bg={canSubmit ? '#edf4e6' : 'white'} color={canSubmit ? '#405a32' : '#718078'} fontSize="11px" fontWeight="700">
          <Box boxSize="7px" borderRadius="full" bg={canSubmit ? '#75a34c' : '#c1c9c1'} />
          {canSubmit ? 'READY TO ASSESS' : 'SETUP IN PROGRESS'}
        </Flex>
      </Flex>

      <Stack spacing={2} px={{ base: 1, md: 2 }}>
        <Flex align="center" justify="space-between" gap={3}>
          <Text color="#526158" fontSize="11px" fontWeight="650">COMPARISON SETUP</Text>
          <Text color="#718078" fontSize="11px" fontWeight="600">{setupProgress}% complete</Text>
        </Flex>
        <Flex gap={1} aria-label={`${setupProgress}% of setup complete`}>
          {[0, 1].map((step) => (
            <Box key={step} flex="1" h="4px" borderRadius="full" bg={setupProgress >= (step + 1) * 50 ? '#83a65e' : '#dfe5dc'} transition="background 180ms ease" />
          ))}
        </Flex>
        <HStack justify="space-between" color="#718078" fontSize="10px">
          <Text color={resumeId ? '#405a32' : '#718078'}>01 Select resume</Text>
          <Text color={descriptionLength >= 50 ? '#405a32' : '#718078'}>02 Add job description</Text>
        </HStack>
      </Stack>

      <Box as="form" onSubmit={handleSubmit}>
        <Grid templateColumns={{ base: '1fr', lg: '0.9fr 1.1fr' }} gap={{ base: 4, md: 5 }}>
          <Stack spacing={3} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
            <Flex align="center" justify="space-between" gap={3}>
              <Box>
                <Text color="#34463a" fontSize="12px" fontWeight="700">01 / YOUR RESUME</Text>
                <Text mt={1} color="#718078" fontSize="11px">Choose the version to assess</Text>
              </Box>
              <Text color="#839087" fontSize="10px">{history.length} SAVED</Text>
            </Flex>

            {isHistoryLoading ? (
              <Stack spacing={2}>
                {[0, 1].map((item) => <Box key={item} h="66px" borderRadius="6px" bg="#f2f4f0" />)}
              </Stack>
            ) : history.length > 0 ? (
              <Stack role="radiogroup" aria-label="Choose a resume" spacing={2} maxH={{ base: '230px', lg: '350px' }} overflowY="auto" pr={1}>
                {[...history].reverse().map((resume) => {
                  const isSelected = resumeId === resume.id
                  return (
                    <Box
                      as="button"
                      key={resume.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => updateInputs({ resumeId: resume.id })}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      w="100%"
                      minH="68px"
                      px={3}
                      py={2}
                      border="1px solid"
                      borderColor={isSelected ? '#729455' : '#e2e8df'}
                      borderRadius="6px"
                      bg={isSelected ? '#f1f6eb' : 'white'}
                      textAlign="left"
                      transition="border-color 150ms ease, background 150ms ease, transform 150ms ease"
                      _hover={{ borderColor: '#8ba875', transform: 'translateY(-1px)' }}
                      _focusVisible={{ outline: '2px solid #83a65e', outlineOffset: '2px' }}
                    >
                      <Flex align="center" justify="center" flexShrink={0} boxSize="34px" borderRadius="5px" bg={isSelected ? '#dcebc9' : '#f1f3ef'} color={isSelected ? '#405a32' : '#839087'} fontSize="10px" fontWeight="750">
                        CV
                      </Flex>
                      <Box flex="1" minW={0}>
                        <Text overflow="hidden" color="#25372f" fontSize="12px" fontWeight="650" textOverflow="ellipsis" whiteSpace="nowrap">
                          {resume.title}
                        </Text>
                        <Text mt="3px" color="#718078" fontSize="10px">{formatDate(resume.date)} · Resume score {resume.score}</Text>
                      </Box>
                      <Flex align="center" justify="center" flexShrink={0} boxSize="17px" border="1px solid" borderColor={isSelected ? '#608044' : '#cdd5cb'} borderRadius="full" bg={isSelected ? '#608044' : 'white'} color="white" fontSize="10px">
                        {isSelected ? '✓' : ''}
                      </Flex>
                    </Box>
                  )
                })}
              </Stack>
            ) : (
              <Box p={4} border="1px dashed #cbd4c9" borderRadius="6px" bg="#f7f8f5">
                <Text color="#34463a" fontSize="12px" fontWeight="650">No saved resumes yet</Text>
                <Text mt={1} color="#718078" fontSize="11px">Upload a resume first, then return here to compare it.</Text>
              </Box>
            )}
          </Stack>

          <Stack spacing={3} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
            <Flex align="center" justify="space-between" gap={3}>
              <Box>
                <Text color="#34463a" fontSize="12px" fontWeight="700">02 / JOB DESCRIPTION</Text>
                <Text mt={1} color="#718078" fontSize="11px">Paste the full listing for a more useful assessment</Text>
              </Box>
              <Button type="button" variant="ghost" size="xs" onClick={() => void handlePaste()} color="#405a32" fontSize="10px" fontWeight="700" _hover={{ bg: '#f1f6eb' }}>
                Paste from clipboard
              </Button>
            </Flex>

            <Textarea
              id="job-description"
              aria-label="Job description"
              value={jobDescription}
              onChange={(event) => {
                updateInputs({ jobDescription: event.target.value })
                setError('')
              }}
              minH={{ base: '190px', lg: '244px' }}
              resize="vertical"
              placeholder="Paste the job title, responsibilities, and qualifications here..."
              borderColor="#d9e1d5"
              fontSize="12px"
              lineHeight="1.7"
              _focusVisible={{ borderColor: '#729455', boxShadow: '0 0 0 1px #729455' }}
              _placeholder={{ color: '#89948d' }}
            />

            <Flex align="center" justify="space-between" gap={3}>
              <Text color={descriptionLength >= 50 ? '#526b40' : '#9a6756'} fontSize="10px" fontWeight="600">
                {descriptionLength >= 50 ? 'Description ready' : `${50 - descriptionLength} more characters needed`}
              </Text>
              <HStack spacing={3}>
                <Text color="#839087" fontSize="10px" sx={{ fontVariantNumeric: 'tabular-nums' }}>{descriptionLength} chars</Text>
                {jobDescription && (
                  <Button type="button" variant="ghost" size="xs" onClick={() => updateInputs({ jobDescription: '' })} color="#718078" fontSize="10px" _hover={{ bg: '#f3f5f0' }}>
                    Clear
                  </Button>
                )}
              </HStack>
            </Flex>
          </Stack>
        </Grid>

        <Flex align={{ base: 'stretch', sm: 'center' }} justify="space-between" direction={{ base: 'column', sm: 'row' }} gap={3} mt={4}>
          <Text color={error ? '#b44f3b' : '#718078'} fontSize="11px" role={error ? 'alert' : undefined}>
            {error || 'Your resume text is analyzed securely and is not shown in the resume list.'}
          </Text>
          <Button
            type="submit"
            alignSelf={{ base: 'flex-start', sm: 'auto' }}
            h="44px"
            px={5}
            bg={canSubmit ? '#234136' : '#dfe5dc'}
            color={canSubmit ? 'white' : '#78837a'}
            fontSize="12px"
            fontWeight="700"
            isLoading={isSubmitting}
            isDisabled={!canSubmit}
            loadingText="Assessing resume"
            _hover={{ bg: '#315743', transform: 'translateY(-1px)' }}
            _disabled={{ bg: '#edf0eb', color: '#9ba49c', cursor: 'not-allowed', transform: 'none' }}
          >
            {result ? 'Run assessment again' : 'Assess my fit'}
          </Button>
        </Flex>
      </Box>

      {result && (
        <Stack spacing={4}>
          <Flex align="center" gap={{ base: 4, md: 6 }} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="#e4f1c8">
            <Flex align="center" justify="center" flexShrink={0} boxSize={{ base: '90px', md: '108px' }} borderRadius="full" bg={`conic-gradient(#648748 ${result.matchScore * 3.6}deg, #cbdab8 0deg)`} role="progressbar" aria-label="Estimated resume fit" aria-valuenow={result.matchScore} aria-valuemin={0} aria-valuemax={100}>
              <Flex align="center" justify="center" direction="column" boxSize={{ base: '74px', md: '90px' }} borderRadius="full" bg="#e4f1c8">
                <Text color="#18392e" fontFamily="Georgia, 'Times New Roman', serif" fontSize={{ base: '25px', md: '29px' }} lineHeight="1">{result.matchScore}%</Text>
                <Text mt={1} color="#526b40" fontSize="8px" fontWeight="700">ESTIMATED</Text>
              </Flex>
            </Flex>
            <Box flex="1">
              <Text color="#294832" fontSize="15px" fontWeight="700">Your fit at a glance</Text>
              <Text mt={1} color="#526b40" fontSize="12px" lineHeight="1.6">Based on qualifications and experience described in your resume.</Text>
              <Text mt={2} color="#405a32" fontSize="11px" fontWeight="650">{result.gaps.length} resume gaps · {result.recommendations.length} recommended actions</Text>
            </Box>
          </Flex>

          <Stack spacing={4} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
            <Box>
              <Text color="#34463a" fontSize="12px" fontWeight="700">ASSESSMENT</Text>
              <Text mt={2} color="#526158" fontSize="13px" lineHeight="1.7">{result.summary}</Text>
            </Box>
            {result.alignedQualifications.length > 0 && (
              <Box>
                <Text mb={2} color="#405a32" fontSize="12px" fontWeight="700">WHAT ALREADY ALIGNS</Text>
                <Stack as="ul" spacing={2} pl={5} color="#526158" fontSize="13px" lineHeight="1.6">
                  {result.alignedQualifications.map((qualification) => <Text as="li" key={qualification}>{qualification}</Text>)}
                </Stack>
              </Box>
            )}
          </Stack>

          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
            <Stack spacing={3} p={{ base: 4, md: 5 }} border="1px solid #e4d9d2" borderRadius="8px" bg="white">
              <Text color="#8a4839" fontSize="12px" fontWeight="700">GAPS IN YOUR RESUME</Text>
              <Stack spacing={3} maxH={{ base: '280px', md: '360px' }} overflowY="auto" pr={2}>
                {result.gaps.length > 0 ? result.gaps.map((gap, index) => (
                  <Box key={`${gap.requirement}-${index}`} py={2} borderTop="1px solid #f0e8e3" _first={{ borderTop: 'none', pt: 0 }}>
                    <Flex align="flex-start" justify="space-between" gap={3}>
                      <Text color="#34463a" fontSize="13px" fontWeight="650">{gap.requirement}</Text>
                      <Text flexShrink={0} color={gap.priority === 'High' ? '#a83d30' : '#8a6a42'} fontSize="10px" fontWeight="700">{gap.priority.toUpperCase()}</Text>
                    </Flex>
                    <Text mt={1} color="#718078" fontSize="12px" lineHeight="1.6">{gap.evidenceInResume}</Text>
                  </Box>
                )) : (
                  <Text color="#526158" fontSize="12px">No significant gaps were identified from the information provided.</Text>
                )}
              </Stack>
            </Stack>
            <Stack spacing={3} p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
              <Flex align="center" justify="space-between" gap={3}>
                <Box>
                  <Text color="#34463a" fontSize="12px" fontWeight="700">YOUR ACTION PLAN</Text>
                  <Text mt={1} color="#718078" fontSize="10px">{completedActions} of {result.recommendations.length} steps complete</Text>
                </Box>
                <Button type="button" variant="ghost" size="xs" onClick={() => void handleCopyPlan()} color="#405a32" fontSize="10px" fontWeight="700" _hover={{ bg: '#f1f6eb' }}>
                  {copyStatus || 'Copy plan'}
                </Button>
              </Flex>
              <Stack spacing={3} maxH={{ base: '280px', md: '360px' }} overflowY="auto" pr={2}>
                {result.recommendations.length > 0 ? result.recommendations.map((recommendation, index) => {
                  const isComplete = comparison.completedRecommendationIndices.includes(index)
                  return (
                    <Flex key={`${recommendation.action}-${index}`} align="flex-start" gap={3} py={2} borderTop="1px solid #e7ece3" _first={{ borderTop: 'none', pt: 0 }}>
                      <Checkbox
                        mt="2px"
                        flexShrink={0}
                        colorScheme="green"
                        isChecked={isComplete}
                        onChange={(event) => toggleRecommendation(index, event.target.checked)}
                        aria-label={`Mark as complete: ${recommendation.action}`}
                      />
                      <Box>
                        <Text color={isComplete ? '#718078' : '#34463a'} fontSize="13px" fontWeight="650" textDecoration={isComplete ? 'line-through' : 'none'}>
                          {recommendation.action}
                        </Text>
                        {recommendation.reason && <Text mt={1} color="#718078" fontSize="12px" lineHeight="1.6">{recommendation.reason}</Text>}
                      </Box>
                    </Flex>
                  )
                }) : (
                  <Text color="#526158" fontSize="12px">No specific changes were suggested.</Text>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Stack>
      )}
    </Stack>
  )
}

export default JobMatch