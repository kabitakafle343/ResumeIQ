

import { Box, Button, Flex, HStack, Link, Text } from '@chakra-ui/react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { userLogout } from '../api/query'
import TokenService from '../api/tokenservice'
import { route } from '../routes/route.constant'
import { showToast } from '../utils/toaster'

const pageDetails: Record<string, { title: string; description: string }> = {
  [route.dashboard]: { title: 'Dashboard', description: 'Your resume workspace' },
  [route.upload]: { title: 'New analysis', description: 'Make your next application count' },
}

const Header = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const page = pageDetails[pathname] ?? pageDetails[route.dashboard]
  const user = TokenService.getUserDetail();
  console.log("user",user)

  const handleLogout = () => {
    TokenService.clearToken()
         showToast("Logout successfully", "success", "top-right");
    void userLogout()
      .catch((error) => console.error('Logout request failed', error))
    navigate(route.login, { replace: true })
  }

  return (
    <Flex
      as="header"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
      align="center"
      minH={{ base: '72px', md: '84px' }}
      px={{ base: 4, md: 8 }}
      py={{ base: 3, md: 0 }}
      rowGap={{ base: 3, md: 0 }}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      position="relative"
      zIndex="1"
    >
      <Link as={RouterLink} to={route.dashboard} _hover={{ textDecoration: 'none' }} aria-label="ResumeIQ dashboard">
        <HStack spacing={3} minW={{ md: '250px' }}>
          <Flex align="center" justify="center" boxSize="39px" borderRadius="12px" bg="#d5f277" color="#193328" fontFamily="Georgia, 'Times New Roman', serif" fontSize="23px" fontWeight="700">
            R
          </Flex>
          <Text fontSize="20px" fontWeight="750" color="#1e2924" letterSpacing="0">
            Resume<Text as="span" color="#6e806f" fontWeight="500">IQ</Text>
          </Text>
        </HStack>
      </Link>

      <Box ml={{ base: 4, md: 0 }} display={{ base: 'none', md: 'block' }}>
        <Text color="#839087" fontSize="9px" fontWeight="750" letterSpacing="1.2px">YOUR CAREER, IN FOCUS</Text>
        <Text as="h1" mt="1px" color="#1e2924" fontSize="17px" fontWeight="650" lineHeight="1.2">{page.title}</Text>
      </Box>

      <HStack w={{ base: '100%', md: 'auto' }} justify={{ base: 'space-between', md: 'initial' }} spacing={{ base: 2, md: 4 }} ml="auto">
        <HStack minW={0} spacing={2}>
          <Flex align="center" justify="center" flexShrink={0} boxSize="34px" borderRadius="full" bg="#e8eee3" color="#34533f" fontSize="13px" fontWeight="700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Flex>
          <Box minW={0}>
            <Text maxW={{ base: '150px', md: '180px' }} overflow="hidden" color="#26342c" fontSize="12px" fontWeight="650" textOverflow="ellipsis" whiteSpace="nowrap">
              {user?.name || 'Your account'}
            </Text>
            <Text maxW={{ base: '150px', md: '180px' }} overflow="hidden" color="#77847b" fontSize="10px" textOverflow="ellipsis" whiteSpace="nowrap">
              {user?.email || 'Account details unavailable'}
            </Text>
          </Box>
        </HStack>
        <Button
          as={RouterLink}
          to={route.upload}
          display={{ base: 'none', md: 'inline-flex' }}
          minH="42px"
          px={4}
          borderRadius="7px"
          bg="#1e3930"
          color="white"
          fontSize="12px"
          fontWeight="650"
          _hover={{ bg: '#2b5142', transform: 'translateY(-1px)' }}
          _active={{ bg: '#1e3930' }}
        >
          <Text as="span" mr={2} color="#d5f277" fontSize="19px" fontWeight="400" lineHeight="1">+</Text>
          Upload resume
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          minH="38px"
          px={{ base: 2, md: 3 }}
          color="#53645a"
          fontSize="12px"
          fontWeight="600"
          _hover={{ bg: '#f0f3ed', color: '#1e3930' }}
          aria-label="Log out"
        >
          <Text as="span" mr={1} aria-hidden="true">↪</Text>
          Log out
        </Button>
      </HStack>
    </Flex>
  )
}

export default Header