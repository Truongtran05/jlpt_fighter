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
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { saveAuthSession } from "../utils/AuthStorage"
import useAuth from "../hooks/UseAuth"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loginResponse,isLoginLoading, auth, loginError] = useAuth("login")

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try{
      const response = await auth(formData)
      const redirectPath = location.state?.from?.pathname || "/"
      saveAuthSession(response)
      navigate(redirectPath, { replace: true })
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  return (
    <FullScreenVSection
      backgroundColor="#14532d"
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
              Log in
            </Heading>
            <Text color="gray.600">
              Continue your JLPT practice.
            </Text>
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
              autoComplete="current-password"
              required
            />
          </VStack>

          {loginError && (
            <Text color="red.600" fontWeight="semibold">
              {loginError}
            </Text>
          )}

          <Button
            type="submit"
            colorPalette="green"
            loading={isLoginLoading}
            loadingText="Logging in"
          >
            Log in
          </Button>

          <Text color="gray.600" textAlign="center">
            Need an account?{" "}
            <ChakraLink asChild color="green.700" fontWeight="semibold">
              <RouterLink to="/register">Register</RouterLink>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </FullScreenVSection>
  )
}
