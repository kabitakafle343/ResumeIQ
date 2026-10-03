import { Box, Flex } from '@chakra-ui/react'
import React from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import { ResumeHistoryProvider } from '../context/ResumeHistoryContext'
import { route } from '../routes/route.constant'

const Layout = ({children}:{children:React.ReactNode}) => {
  const { pathname } = useLocation()
  const isPublicRoute = pathname === route.login || pathname === route.singup

  if (isPublicRoute) {
    return <Box>{children}</Box>
  }

  return (
    <ResumeHistoryProvider>
      <Box minH="100vh" bg="#f3f5f0" color="#1e2924">
        <Header />
        <Flex direction={{ base: 'column', md: 'row' }} minH={{ base: 'calc(100vh - 72px)', md: 'calc(100vh - 84px)' }}>
          <Sidebar />
          <Box
            as="main"
            flex="1"
            minW="0"
            px={{ base: 5, md: 'clamp(22px, 4vw, 58px)' }}
            pt={pathname === route.upload ? { base: 4, md: 6 } : { base: 6, md: 9 }}
            pb={{ base: 6, md: 9 }}
          >
            {children}
          </Box>
        </Flex>
      </Box>
    </ResumeHistoryProvider>
  )
}

export default Layout