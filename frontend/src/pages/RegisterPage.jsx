import FullScreenVSection from "../layouts/FullScreenVSection"
import {
  Box,
  Button,
  Heading,
  Input,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { saveAuthSession } from "../utils/AuthStorage"
import useAuth from "../hooks/UseAuth"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [, isRegisterLoading, resgisterAuth, registerError] = useAuth("register")
  const [, isLoginLoading, loginAuth, loginError] = useAuth("login")
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await resgisterAuth(formData)
      const loginResponse = await loginAuth(formData)
      saveAuthSession(loginResponse)
      navigate("/", { replace: true })
    } catch (registerError) {
      const responseData = registerError.response?.data
      const responseMessage =
        responseData?.email?.[0] ||
        responseData?.name?.[0] ||
        responseData?.password?.[0] ||
        responseData?.detail ||
        responseData?.error ||
        "Unable to create an account with those details."
      setError(responseMessage)
    }
  }

  return (
    <FullScreenVSection
      backgroundColor="bushido.surface"
      isDarkBackground={true}
      alignItems="center"
      justifyContent="center"
      paddingX={6}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        width="100%"
        maxWidth="420px"
        backgroundColor="white"
        color="gray.900"
        borderRadius="8px"
        padding={8}
        boxShadow="0 18px 45px rgba(0, 0, 0, 0.28)"
      >
        <VStack gap={5} align="stretch">
          <VStack gap={2} align="stretch">
            <Heading as="h1" size="xl">
              Register
            </Heading>
            <Text color="bushido.muted">
              Create your JLPT Fighter account.
            </Text>
          </VStack>

          <VStack gap={2} align="stretch">
            <Text as="label" htmlFor="name" fontWeight="semibold">
              Name
            </Text>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </VStack>

          <VStack gap={2} align="stretch">
            <Text as="label" htmlFor="email" fontWeight="semibold">
              Email
            </Text>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </VStack>

          <VStack gap={2} align="stretch">
            <Text as="label" htmlFor="password" fontWeight="semibold">
              Password
            </Text>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </VStack>

          {(error || loginError || registerError) && (
            <Text color="red.600" fontWeight="semibold">
              {error || loginError || registerError}
            </Text>
          )}

          <Button
            type="submit"
            colorPalette="green"
            loading={isRegisterLoading || isLoginLoading}
            loadingText="Creating account"
          >
            Create account
          </Button>

          <Text color="bushido.muted" textAlign="center">
            Already have an account?{" "}
            <ChakraLink asChild color="bushido.primary" fontWeight="semibold">
              <RouterLink to="/login">Log in</RouterLink>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </FullScreenVSection>
  )
}
