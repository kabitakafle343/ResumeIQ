import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import * as yup from "yup";
import { userLogin } from "../api/query";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toaster";

const defaultFormValues = {
  email: "",
  password: "",
};

const userSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate=useNavigate()
  const [loginError, setLoginError] = useState("");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFormValues,
    resolver: yupResolver(userSchema),
  });

  const handleFormSubmit = async (data: typeof defaultFormValues) => {
    setLoginError("");
    try {
      await userLogin(data);
      navigate("/dashboard");
     showToast("Login successfully", "success", "top-right");
    } catch (error) {
      console.error("Login failed", error);
      setLoginError(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Unable to reach the login service"
          : "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <Flex
      minH="100svh"
      direction={{ base: "column", lg: "row" }}
      bg="#f5f1e9"
      color="#242820"
    >
      <Flex
        flex="1.08"
        minH={{ base: "340px", lg: "100svh" }}
        position="relative"
        overflow="hidden"
        align="stretch"
        bg="#645747"
      >
        <Image
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=85"
          alt="Colleagues sharing ideas around a table"
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center"
        />
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-b, rgba(22, 27, 23, 0.14), rgba(22, 27, 23, 0.76))"
        />
        <Flex
          position="relative"
          zIndex={1}
          direction="column"
          justify="space-between"
          w="100%"
          px={{ base: 6, md: 10, xl: 16 }}
          py={{ base: 6, md: 10, xl: 14 }}
          color="white"
        >
          <HStack spacing={3}>
            <Flex
              align="center"
              justify="center"
              w="38px"
              h="38px"
              bg="#d77756"
              borderRadius="12px 12px 12px 3px"
              fontFamily="Georgia, serif"
              fontSize="xl"
              fontWeight="bold"
            >
              R
            </Flex>
            <Text fontSize="md" fontWeight="700" letterSpacing="0.02em">
              ResumeIQ
            </Text>
          </HStack>

          <Box maxW="540px" mt={{ base: 12, lg: 0 }}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.12em"
              textTransform="uppercase"
              color="#f2c5a9"
              mb={4}
            >
              Your experience, in your words
            </Text>
            <Heading
              as="h1"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="400"
              lineHeight="1.08"
              maxW="520px"
            >
              Your next chapter should sound like you.
            </Heading>
            <Text
              mt={5}
              maxW="410px"
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.8"
              color="whiteAlpha.900"
            >
              You bring the experience. We&apos;ll help you find the words to
              show it.
            </Text>
          </Box>

          <Text fontSize="xs" color="whiteAlpha.800" mt={10}>
            A little more clarity for whatever comes next.
          </Text>
        </Flex>
      </Flex>

      <Flex
        flex="0.92"
        align="center"
        justify="center"
        px={{ base: 6, sm: 10, lg: 12, xl: 20 }}
        py={{ base: 10, md: 14, lg: 8 }}
        bg="#fbfaf7"
      >
        <Box w="100%" maxW="390px">
          <VStack spacing={8} align="stretch">
            <Box>
              <Text
                fontSize="sm"
                fontWeight="600"
                color="#b45f43"
                mb={3}
              >
                Welcome back
              </Text>
              <Heading
                as="h2"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="400"
                lineHeight="1.15"
                color="#242820"
              >
                Good to see you again.
              </Heading>
              <Text mt={3} color="#6f7169" fontSize="sm" lineHeight="1.7">
                Pick up right where your next move begins.
              </Text>
            </Box>

            {loginError && (
              <Alert status="error" borderRadius="8px" fontSize="sm">
                <AlertIcon />
                {loginError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <VStack spacing={5} align="stretch">
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontWeight="600" color="#373a33" fontSize="sm">
                    Email address
                  </FormLabel>
                  <Input
                    type="email"
                    {...register("email")}
                    size="lg"
                    h="54px"
                    bg="white"
                    borderRadius="8px"
                    borderColor="#dedbd2"
                    _placeholder={{ color: "#a4a39b" }}
                    _hover={{ borderColor: "#aaa69a" }}
                    _focus={{
                      borderColor: "#b45f43",
                      boxShadow: "0 0 0 1px #b45f43",
                    }}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontWeight="600" color="#373a33" fontSize="sm">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    {...register("password")}
                    size="lg"
                    h="54px"
                    bg="white"
                    borderRadius="8px"
                    borderColor="#dedbd2"
                    _placeholder={{ color: "#a4a39b" }}
                    _hover={{ borderColor: "#aaa69a" }}
                    _focus={{
                      borderColor: "#b45f43",
                      boxShadow: "0 0 0 1px #b45f43",
                    }}
                  />
                  <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  size="lg"
                  h="54px"
                  mt={2}
                  bg="#28382f"
                  color="white"
                  borderRadius="8px"
                  fontWeight="600"
                  _hover={{ bg: "#354a3e", transform: "translateY(-1px)" }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 160ms ease"
                >
                  Sign in
                </Button>

                <HStack justify="center" spacing={1} fontSize="sm" pt={1}>
                  <Text color="#77786f">New around here?</Text>
                  <Text
                    as="a"
                    href="/signup"
                    color="#a64e35"
                    fontWeight="700"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Create an account
                  </Text>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;
