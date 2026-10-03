

import { Box, Button, Flex, Grid, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useResumeHistory } from '../context/useResumeHistory'
import { route } from '../routes/route.constant'

const ScoreTrend = ({ scores }: { scores: { id: string; score: number }[] }) => {
  if (scores.length === 0) {
    return (
      <Flex align="center" justify="center" minH="150px" color="#718078" fontSize="13px">
        Upload a resume to see your score trend.
      </Flex>
    )
  }

  const chartWidth = 600
  const chartHeight = 180
  const horizontalPadding = scores.length === 1 ? chartWidth / 2 : 42
  const verticalPadding = 24
  const minimumScore = Math.max(0, Math.min(...scores.map((item) => item.score)) - 12)
  const maximumScore = Math.min(100, Math.max(...scores.map((item) => item.score)) + 12)
  const scoreRange = Math.max(1, maximumScore - minimumScore)
  const chartPoints = scores.map((item, index) => {
    const x = scores.length === 1
      ? chartWidth / 2
      : horizontalPadding + index * (chartWidth - horizontalPadding * 2) / (scores.length - 1)
    const y = chartHeight - verticalPadding
      - (item.score - minimumScore) / scoreRange * (chartHeight - verticalPadding * 2)
    return { ...item, x, y, version: `v${index + 1}` }
  })

  return (
    <Box>
      <Box as="svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`} w="100%" h={{ base: '150px', md: '180px' }} role="img" aria-label="Resume score trend">
        {[0, 1, 2].map((line) => {
          const y = verticalPadding + line * (chartHeight - verticalPadding * 2) / 2
          return <line key={line} x1="24" x2={chartWidth - 24} y1={y} y2={y} stroke="#e7ece3" strokeWidth="1" />
        })}
        {chartPoints.length > 1 && (
          <polyline
            fill="none"
            stroke="#24483a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={chartPoints.map((point) => `${point.x},${point.y}`).join(' ')}
          />
        )}
        {chartPoints.map((point, index) => (
          <g key={point.id}>
            <text x={point.x} y={Math.max(13, point.y - 12)} textAnchor="middle" fill="#263a30" fontSize="12" fontWeight="700">
              {point.score}
            </text>
            <circle cx={point.x} cy={point.y} r="5" fill={index === chartPoints.length - 1 ? '#d5f277' : '#a7c28d'} stroke="#24483a" strokeWidth="2" />
            <text x={point.x} y={chartHeight - 2} textAnchor="middle" fill="#526158" fontSize="11" fontWeight="600">
              {point.version}
            </text>
          </g>
        ))}
      </Box>
    </Box>
  )
}

const Dashboard = () => {
  const { history, historyData, isHistoryLoading } = useResumeHistory()
  const recentScores = history.slice(-6)
  const latestScore = historyData?.latestScore ?? recentScores.at(-1)?.score ?? null
  const scoreImprovement = historyData?.scoreImprovement
  const improvementLabel = scoreImprovement == null
    ? '—'
    : `${scoreImprovement > 0 ? '+' : ''}${scoreImprovement}`
  const commonIssues = historyData?.commonIssues ?? []
  const highestIssueCount = Math.max(1, ...commonIssues.map((item) => item.count))
  const stats = [
    { label: 'Latest score', value: latestScore == null ? '—' : latestScore, detail: 'out of 100', color: '#18392e' },
    { label: 'Since first upload', value: improvementLabel, detail: 'points changed', color: scoreImprovement != null && scoreImprovement > 0 ? '#527434' : '#18392e' },
    { label: 'Analyses', value: historyData?.totalAnalyses ?? (isHistoryLoading ? '—' : 0), detail: 'resumes reviewed', color: '#18392e' },
  ]

  return (
    <Stack maxW="1120px" mx="auto" spacing={{ base: 4, md: 5 }}>
      <Flex align={{ base: 'flex-start', sm: 'center' }} justify="space-between" direction={{ base: 'column', sm: 'row' }} gap={4}>
        <Box>
          <Heading as="h1" color="#21372d" fontFamily="Georgia, 'Times New Roman', serif" fontSize={{ base: '29px', md: '34px' }} fontWeight="400" lineHeight="1.15">
            Your progress
          </Heading>
          <Text mt={2} color="#526158" fontSize="14px">
            Track how your resume improves with every version.
          </Text>
        </Box>
        <Button
          as={RouterLink}
          to={route.upload}
          h="42px"
          px={4}
          borderRadius="6px"
          bg="#234136"
          color="white"
          fontSize="12px"
          fontWeight="650"
          _hover={{ bg: '#315743' }}
        >
          Analyze a resume
          <Text as="span" ml={2} color="#d5f277" fontSize="16px" fontWeight="400" aria-hidden="true">↗</Text>
        </Button>
      </Flex>

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }} gap={3}>
        {stats.map((stat) => (
          <Stack key={stat.label} spacing={1} minH="98px" justify="center" px={4} py={3} border="1px solid #d9e1d5" borderTop="3px solid #d5f277" borderRadius="8px" bg="white">
            <Text color="#526158" fontSize="12px" fontWeight="600">{stat.label}</Text>
            <HStack align="baseline" spacing={2}>
              <Text color={stat.color} fontFamily="Georgia, 'Times New Roman', serif" fontSize="30px" lineHeight="1.1">
                {isHistoryLoading && stat.value === '—' ? '…' : stat.value}
              </Text>
              <Text color="#718078" fontSize="10px">{stat.detail}</Text>
            </HStack>
          </Stack>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.55fr) minmax(270px, 1fr)' }} gap={3} alignItems="stretch">
        <Stack spacing={3} minW="0" minH="250px" p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
          <HStack align="center" justify="space-between" gap={3}>
            <Text color="#526158" fontSize="11px" fontWeight="700" letterSpacing="0.5px">
              SCORE TREND
            </Text>
            {recentScores.length > 0 && <Text color="#718078" fontSize="11px">Last {recentScores.length} resumes</Text>}
          </HStack>
          {isHistoryLoading && history.length === 0
            ? <Flex flex="1" align="center" justify="center" color="#718078" fontSize="13px">Loading your analyses…</Flex>
            : <ScoreTrend scores={recentScores} />}
        </Stack>

        <Stack spacing={4} minW="0" minH="250px" p={{ base: 4, md: 5 }} border="1px solid #d9e1d5" borderRadius="8px" bg="white">
          <Box>
            <Text color="#526158" fontSize="11px" fontWeight="700" letterSpacing="0.5px">
              MOST COMMON ISSUES
            </Text>
            <Text mt={1} color="#718078" fontSize="11px">Repeated feedback across your resumes</Text>
          </Box>
          {commonIssues.length > 0 ? (
            <VStack align="stretch" spacing={3}>
              {commonIssues.slice(0, 5).map((item) => (
                <Box key={item.issue}>
                  <HStack justify="space-between" mb={2} spacing={3}>
                    <Text overflow="hidden" color="#263a30" fontSize="13px" fontWeight="550" textOverflow="ellipsis" whiteSpace="nowrap" title={item.issue}>
                      {item.issue}
                    </Text>
                    <Text flexShrink={0} color="#526158" fontSize="11px" fontWeight="650">{item.count}×</Text>
                  </HStack>
                  <Box h="8px" overflow="hidden" borderRadius="full" bg="#e4e9df">
                    <Box h="100%" w={`${Math.max(8, item.count / highestIssueCount * 100)}%`} borderRadius="full" bg="#24483a" />
                  </Box>
                </Box>
              ))}
            </VStack>
          ) : (
            <Flex flex="1" align="center" justify="center" color="#718078" fontSize="13px" textAlign="center">
              {isHistoryLoading ? 'Loading issue trends…' : 'No recurring issues found yet.'}
            </Flex>
          )}
        </Stack>
      </Grid>
    </Stack>
  )
}

export default Dashboard