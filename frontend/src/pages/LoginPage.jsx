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
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function LoginPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [, isLoginLoading, auth, loginError] = useAuth("login")

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
        color="bushido.ink"
        borderRadius="4px"
        borderWidth="1px"
        padding={8}
      >
        <VStack gap={5} align="stretch">
          <VStack gap={2} align="stretch">
            <Heading as="h1" size="xl">
              {t("Log in")}
            </Heading>
            <Text color="bushido.muted">
              {t("Continue your JLPT practice.")}
            </Text>
          </VStack>

          <VStack gap={2} align="stretch">
            <Text as="label" htmlFor="email" fontWeight="semibold">
              {t("Email")}
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
              {t("Password")}
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
              {t(loginError)}
            </Text>
          )}

          <Button
            type="submit"
            backgroundColor="bushido.primary"
            color="white"
            loading={isLoginLoading}
            loadingText={t("Logging in")}
          >
            {t("Log in")}
          </Button>

          <Text color="bushido.muted" textAlign="center">
            {t("Need an account?")}{" "}
            <ChakraLink asChild color="bushido.primary" fontWeight="semibold">
              <RouterLink to="/register">{t("Register")}</RouterLink>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </FullScreenVSection>
  )
}
