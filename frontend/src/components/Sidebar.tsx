

import { Box, Button, Flex, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { userLogout } from '../api/query'
import TokenService from '../api/tokenservice'
import { route } from '../routes/route.constant'

const Sidebar = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = TokenService.getUserDetail()
  const navigation = [
    { to: route.dashboard, label: 'Overview', index: '01', active: pathname === route.dashboard },
    { to: route.upload, label: 'Analyze a resume', index: '02', active: pathname === route.upload },
    { to: route.history, label: 'History', index: '03', active: pathname === route.history },
    { to: route.jobMatch, label: 'Job match', index: '04', active: pathname === route.jobMatch },
  ]

  const handleLogout = () => {
    TokenService.clearToken()
    void userLogout()
      .catch((error) => console.error('Logout request failed', error))
    navigate(route.login, { replace: true })
  }

  return (
    <Flex as="aside" direction="column" flex={{ base: '0 0 auto', md: '0 0 250px' }} w={{ base: '100%', md: '250px' }} minH={{ base: 'auto', md: 'calc(100vh - 84px)' }} px={{ base: 3, md: 4 }} py={{ base: 3, md: 8 }} bg="#1e3930" color="#eef3e9">
      <Text display={{ base: 'none', md: 'block' }} mx={3} mb={4} color="#9cad9f" fontSize="9px" fontWeight="750" letterSpacing="1.2px">WORKSPACE</Text>
      <VStack as="nav" aria-label="Main navigation" align="stretch" spacing={{ base: 2, md: 1 }} direction={{ base: 'row', md: 'column' }} overflowX={{ base: 'auto', md: 'visible' }}>
        {navigation.map((item) => (
          <Link
            key={item.to}
            as={RouterLink}
            to={item.to}
            aria-current={item.active ? 'page' : undefined}
            display="grid"
            gridTemplateColumns={{ base: '20px auto', md: '27px 1fr 16px' }}
            alignItems="center"
            flex={{ base: '0 0 auto', md: 'initial' }}
            minH={{ base: '40px', md: '47px' }}
            px={3}
            borderRadius="6px"
            bg={item.active ? '#d5f277' : 'transparent'}
            color={item.active ? '#20372c' : '#d0dcd2'}
            fontSize="12px"
            fontWeight={item.active ? '700' : '550'}
            whiteSpace="nowrap"
            _hover={{ textDecoration: 'none', bg: item.active ? '#d5f277' : '#2a493d', color: item.active ? '#20372c' : 'white' }}
          >
            <Text color={item.active ? '#526b40' : '#93a79a'} fontSize="10px" sx={{ fontVariantNumeric: 'tabular-nums' }}>{item.index}</Text>
            <Text>{item.label}</Text>
            <Text display={{ base: 'none', md: 'block' }} color={item.active ? '#536d41' : '#94a89a'} textAlign="right" fontSize="14px" aria-hidden="true">↗</Text>
          </Link>
        ))}
      </VStack>

      <HStack mt={{ base: 2, md: 'auto' }} pt={{ base: 2, md: 4 }} px={2} spacing={3} borderTop="1px solid" borderColor="#3b554a">
        <Flex display={{ base: 'none', md: 'flex' }} align="center" justify="center" flexShrink={0} boxSize="32px" borderRadius="9px" bg="#d5f277" color="#193328" fontFamily="Georgia, 'Times New Roman', serif" fontSize="19px" fontWeight="700" aria-hidden="true">R</Flex>
        <Box minW={0} flex="1">
          <Text color="#f4f6f0" fontSize="11px" fontWeight="650">{user?.name || 'Your account'}</Text>
          <Text mt="2px" overflow="hidden" color="#a8b8ac" fontSize="10px" textOverflow="ellipsis" whiteSpace="nowrap">{user?.email || 'Account details unavailable'}</Text>
        </Box>
        <Button variant="ghost" size="sm" onClick={handleLogout} color="#d0dcd2" fontSize="11px" fontWeight="600" _hover={{ bg: '#2a493d', color: 'white' }} aria-label="Log out">
          <Text as="span" mr={1} aria-hidden="true">↪</Text>
          Log out
        </Button>
      </HStack>
    </Flex>
  )
}

export default Sidebar