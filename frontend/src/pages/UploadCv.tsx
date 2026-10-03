import {
  Box,
  Button,
  CloseButton,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import axios from 'axios'
import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { uploadPdf } from '../api/query'
import { useResumeHistory } from '../context/useResumeHistory'

const maxFileSize = 10 * 1024 * 1024

type ResumeAnalysis = {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

type UploadResponse = {
  message: string
  pdf: {
    analysis: ResumeAnalysis
  }
}

const formatFileSize = (size: number) => {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const UploadCv = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refreshHistory } = useResumeHistory()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(() => {
    const storedResponse = localStorage.getItem('resumeAnalysis')
    return storedResponse ? JSON.parse(storedResponse) as UploadResponse : null
  })
  const [uploadSuccess, setUploadSuccess] = useState(Boolean(uploadResponse))

  const selectFile = (file?: File) => {
    if (!file) return

    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    if (!isPdf) {
      setSelectedFile(null)
      setUploadSuccess(false)
      setFileError('Choose a PDF file to continue.')
      return
    }

    if (file.size > maxFileSize) {
      setSelectedFile(null)
      setUploadSuccess(false)
      setFileError('This file is larger than 10 MB. Choose a smaller resume.')
      return
    }

    setSelectedFile(file)
    setFileError('')
    setUploadSuccess(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return

    setIsUploading(true)
    setFileError('')

    try {
      const response = await uploadPdf(selectedFile) as UploadResponse
      setUploadResponse(response)
      localStorage.setItem('resumeAnalysis', JSON.stringify(response))
      await refreshHistory()
      setUploadSuccess(true)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      setFileError(message || 'Unable to upload your PDF. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileError('')
    setUploadSuccess(false)
  }

  const startAnotherUpload = () => {
    clearFile()
    fileInputRef.current?.click()
  }

  return (
    <Stack maxW="1120px" mx="auto" spacing={{ base: 5, md: 6 }}>
      <Flex align="flex-end" justify="space-between" gap={6}>
        <Box>
          <HStack mb={3} spacing={2}>
            <Box w="22px" h="1px" bg="#b45f43" />
            <Text color="#8a5b49" fontSize="10px" fontWeight="700" letterSpacing="1.2px">
              RESUME WORKSPACE
            </Text>
          </HStack>
          <Heading
            as="h2"
            maxW="640px"
            color="#21372d"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize={{ base: '32px', md: '42px' }}
            fontWeight="400"
            lineHeight="1.12"
          >
            Make your resume work harder.
          </Heading>
          <Text mt={3} maxW="540px" color="#68756d" fontSize="14px" lineHeight="1.7">
            Get a focused review of your experience, strengths, and next steps.
          </Text>
        </Box>
        <HStack display={{ base: 'none', sm: 'flex' }} spacing={2} pb={1} color="#68756d" fontSize="11px">
          <Box w="7px" h="7px" borderRadius="full" bg="#81aa61" />
          PDF · UP TO 10 MB
        </HStack>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1.25fr) minmax(320px, 1fr)' }} gap={{ base: 5, lg: 6 }} alignItems="stretch">
        <Flex
          direction="column"
          align="center"
          justify="center"
          position="relative"
          minH={{ base: '330px', md: '410px' }}
          px={{ base: 5, md: 10 }}
          pt={8}
          pb={14}
          border="1px dashed"
          borderColor={isDragging ? '#738d52' : '#aab7a6'}
          borderRadius="8px"
          bg={isDragging ? '#f2f6eb' : 'linear-gradient(145deg, #fbfcf9 0%, #f5f8f1 100%)'}
          textAlign="center"
          transition="background 150ms ease, border-color 150ms ease"
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
          />
          {selectedFile && !uploadSuccess && (
            <CloseButton
              position="absolute"
              top={3}
              right={3}
              size="sm"
              color="#77847a"
              onClick={clearFile}
              aria-label="Remove selected resume"
            />
          )}
          <Flex position="relative" align="center" justify="center" w="64px" h="76px" mb={6} border="1px solid #dce4d8" borderRadius="8px" bg="white" boxShadow="0 10px 24px rgba(34, 55, 44, 0.08)">
            <VStack spacing={2}>
              <Box w="26px" h="2px" borderRadius="full" bg="#9aac91" />
              <Box w="26px" h="2px" borderRadius="full" bg="#c0cbb9" />
              <Box w="18px" h="2px" mr="8px" borderRadius="full" bg="#c0cbb9" />
            </VStack>
            <Flex position="absolute" right="-13px" bottom="-7px" align="center" justify="center" w="34px" h="20px" borderRadius="4px" bg="#d5f277" color="#36503a" fontSize="8px" fontWeight="800" letterSpacing="0.4px">
              PDF
            </Flex>
          </Flex>

          <Text mb={2} color={uploadSuccess ? '#718658' : '#8a5b49'} fontSize="9px" fontWeight="750" letterSpacing="1.2px">
            {uploadSuccess ? 'ANALYSIS COMPLETE' : selectedFile ? 'READY TO REVIEW' : 'START A NEW REVIEW'}
          </Text>
          <Heading as="h3" maxW="460px" color="#263a30" fontFamily="Georgia, 'Times New Roman', serif" fontSize={{ base: '25px', md: '30px' }} fontWeight="400" lineHeight="1.2">
            {uploadSuccess ? 'Your resume is ready.' : selectedFile ? 'Ready for a closer look.' : 'Drop your resume here.'}
          </Heading>
          <Text mt={3} maxW="400px" overflow="hidden" color="#77847a" fontSize="12px" lineHeight="1.7" textOverflow="ellipsis" whiteSpace="nowrap">
            {selectedFile
              ? `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`
              : 'Get clear, practical feedback on the experience you bring.'}
          </Text>
          {fileError && (
            <Text mt={3} color="#b44f3b" fontSize="12px" role="alert">
              {fileError}
            </Text>
          )}
          <Button
            type="button"
            mt={6}
            h="46px"
            px={6}
            borderRadius="6px"
            bg="#234136"
            color="white"
            fontSize="12px"
            fontWeight="650"
            _hover={{ bg: '#315743', transform: 'translateY(-1px)' }}
            transition="background 150ms ease, transform 150ms ease"
            onClick={uploadSuccess
              ? startAnotherUpload
              : selectedFile ? handleUpload : () => fileInputRef.current?.click()}
            isLoading={isUploading}
            loadingText="Analyzing resume"
          >
            {uploadSuccess ? 'Upload another CV' : selectedFile ? 'Analyze this resume' : 'Choose a PDF'}
            <Text as="span" ml={2} color="#d5f277" fontSize="16px" fontWeight="400" aria-hidden="true">↗</Text>
          </Button>
          <Text mt={4} color="#89958b" fontSize="10px">
            {selectedFile ? 'Not the right file? Remove it to choose another.' : 'PDF format · Maximum file size 10 MB'}
          </Text>
        </Flex>

        <Stack
          spacing={0}
          p={{ base: 5, md: 6 }}
          maxH={{ base: '420px', md: '410px' }}
          overflowY="auto"
          overscrollBehavior="contain"
          border="1px solid #e2e8df"
          borderRadius="8px"
          bg="white"
        >
          <Flex align="center" justify="space-between" gap={3}>
            <Text color="#89958b" fontSize="9px" fontWeight="750" letterSpacing="1.1px">
              LATEST ANALYSIS
            </Text>
            <HStack spacing={2} color={uploadResponse ? '#718658' : '#89958b'} fontSize="9px" fontWeight="700" letterSpacing="0.6px">
              <Box w="6px" h="6px" borderRadius="full" bg={uploadResponse ? '#81aa61' : '#c4ccc1'} />
              {uploadResponse ? 'COMPLETE' : 'AWAITING RESUME'}
            </HStack>
          </Flex>
          <Heading as="h3" mt={4} color="#263a30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="25px" fontWeight="400" lineHeight="1.2">
            {uploadResponse ? 'Your review' : 'A clearer view of your experience.'}
          </Heading>

          {uploadResponse ? (
            <>
              <Flex align="baseline" gap={2} mt={5} px={4} py={3} borderRadius="6px" bg="#f3f6ee">
                <Text color="#304b38" fontSize="32px" fontWeight="700" lineHeight="1">
                  {uploadResponse.pdf.analysis.score}
                </Text>
                <Text color="#526b40" fontSize="13px" fontWeight="650">/ 100 score</Text>
              </Flex>
              <Text mt={4} color="#46564c" fontSize="15px" fontWeight="500" lineHeight="1.7">
                {uploadResponse.pdf.analysis.summary}
              </Text>
              <Divider my={5} borderColor="#e8ece6" />
              <Text color="#263a30" fontSize="13px" fontWeight="700">Strengths</Text>
              <VStack align="stretch" mt={2} spacing={2}>
                {uploadResponse.pdf.analysis.strengths.map((item) => (
                  <HStack key={item} align="flex-start" spacing={2}>
                    <Box mt="8px" flexShrink={0} boxSize="6px" borderRadius="full" bg="#81aa61" />
                    <Text color="#46564c" fontSize="14px" fontWeight="500" lineHeight="1.6">{item}</Text>
                  </HStack>
                ))}
              </VStack>
              <Text mt={5} color="#263a30" fontSize="13px" fontWeight="700">Suggestions</Text>
              <VStack align="stretch" mt={2} spacing={2}>
                {uploadResponse.pdf.analysis.suggestions.map((item) => (
                  <HStack key={item} align="flex-start" spacing={2}>
                    <Box mt="8px" flexShrink={0} boxSize="6px" borderRadius="full" bg="#c56848" />
                    <Text color="#46564c" fontSize="14px" fontWeight="500" lineHeight="1.6">{item}</Text>
                  </HStack>
                ))}
              </VStack>
            </>
          ) : (
            <>
              <Text mt={3} color="#77847a" fontSize="12px" lineHeight="1.7">
                Your feedback will appear here once your resume has been reviewed.
              </Text>
              <Divider my={5} borderColor="#e8ece6" />
              <VStack align="stretch" spacing={0}>
                {[
                  { index: '01', title: 'Experience', detail: 'Roles and career story', color: '#718658' },
                  { index: '02', title: 'Strengths', detail: 'Skills and standout work', color: '#b45f43' },
                  { index: '03', title: 'Opportunities', detail: 'Ideas to sharpen your resume', color: '#718658' },
                ].map((item) => (
                  <HStack key={item.index} align="center" spacing={3} py={3} borderBottom="1px solid #edf0eb">
                    <Text w="24px" color={item.color} fontSize="9px" fontWeight="750">{item.index}</Text>
                    <Box>
                      <Text color="#34463a" fontSize="12px" fontWeight="650">{item.title}</Text>
                      <Text mt="2px" color="#8a958c" fontSize="10px">{item.detail}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </>
          )}
        </Stack>
      </Grid>
    </Stack>
  )
}

export default UploadCv