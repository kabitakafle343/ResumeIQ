import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { userSignUp } from "../api/query";

const defaultFormValues = {
  name: "",
  email: "",
  password: "",
};

const userSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Signup = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: defaultFormValues,
    resolver: yupResolver(userSchema),
  });

  const handleFormSubmit = async (data: any) => {
    try {
      await userSignUp(data);
      console.log("Signup successful", data);
      window.location.href = "/";
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="#f5f1e9"
      px={4}
    >
      <Box
        w={{ base: "100%", md: "460px" }}
        bg="#fffefa"
        p={8}
        borderRadius="16px"
        boxShadow="0 24px 50px rgba(36, 40, 32, 0.12)"
        border="1px solid"
        borderColor="gray.100"
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="lg" mb={2} color="gray.800">
              Create account
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Start building smarter resumes today
            </Text>
          </Box>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <VStack spacing={5} align="stretch">
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontWeight="semibold" color="#373a33">
                  Full name
                </FormLabel>
                <Input
                  type="text"
                  {...register("name")}
                  size="lg"
                  h="54px"
                  bg="white"
                  color="#242820"
                  borderColor="#c8c5bc"
                  borderRadius="8px"
                  _placeholder={{ color: "#77786f" }}
                  _hover={{ borderColor: "#8f8b80" }}
                  _focus={{
                    borderColor: "#b45f43",
                    boxShadow: "0 0 0 1px #b45f43",
                  }}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel fontWeight="semibold" color="#373a33">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  {...register("email")}
                  size="lg"
                  h="54px"
                  bg="white"
                  color="#242820"
                  borderColor="#c8c5bc"
                  borderRadius="8px"
                  _placeholder={{ color: "#77786f" }}
                  _hover={{ borderColor: "#8f8b80" }}
                  _focus={{
                    borderColor: "#b45f43",
                    boxShadow: "0 0 0 1px #b45f43",
                  }}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontWeight="semibold" color="#373a33">
                  Password
                </FormLabel>
                <Input
                  type="password"
                  {...register("password")}
                  size="lg"
                  h="54px"
                  bg="white"
                  color="#242820"
                  borderColor="#c8c5bc"
                  borderRadius="8px"
                  _placeholder={{ color: "#77786f" }}
                  _hover={{ borderColor: "#8f8b80" }}
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
                bg="#28382f"
                color="white"
                _hover={{ bg: "#354a3e" }}
                borderRadius="8px"
                fontWeight="600"
              >
                Create account
              </Button>
              <Text textAlign="center" fontSize="sm" color="gray.500">
                Already have an account?{" "}
                <Text as="a" href="/" color="#a64e35" fontWeight="700">
                  Sign in
                </Text>
              </Text>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Signup;
