import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LuBookOpen,
  LuBrain,
  LuCalendarDays,
  LuCheck,
  LuClock,
  LuLanguages,
  LuLayers,
  LuLogOut,
  LuUserRound,
} from "react-icons/lu"
import FullScreenVSection from "../layouts/FullScreenVSection.jsx"
import { getCurrentAccount, logoutUser } from "../api/services/AuthServices.js"
import { errorMapper } from "../api/core/ErrorMapper.js"
import { clearAuthSession } from "../utils/AuthStorage.js"

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value))
  : "No data"

export default function AccountPage() {
  const navigate = useNavigate()
  const [accountData, setAccountData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    getCurrentAccount()
      .then(({ data }) => setAccountData(data))
      .catch((requestError) => setError(errorMapper(requestError).message))
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } finally {
      clearAuthSession()
      navigate("/explore", { replace: true })
    }
  }

  if (error) {
    return (
      <FullScreenVSection justify="center">
        <Box bg="white" borderWidth="1px" borderColor="bushido.error" borderRadius="4px" p={6}>
          <Heading size="md">Unable to load account</Heading>
          <Text color="bushido.muted" mt={2}>{error}</Text>
        </Box>
      </FullScreenVSection>
    )
  }

  if (!accountData) {
    return <FullScreenVSection justify="center"><Text color="bushido.muted">Loading profile...</Text></FullScreenVSection>
  }

  const totalCards = accountData.total_flashcards || 0
  const completedCards = accountData.total_completed_flashcards || 0
  const mastery = totalCards ? Math.round((completedCards / totalCards) * 100) : 0
  const initial = accountData.name?.trim()?.[0]?.toUpperCase() || accountData.email?.[0]?.toUpperCase() || "?"
  const stats = [
    { label: "Flashcard sets", value: accountData.total_flashcard_sets, note: "Active sets", icon: LuLayers },
    { label: "Total cards", value: totalCards, note: "In your library", icon: LuBookOpen },
    { label: "Remembered", value: completedCards, note: `${mastery}% of all cards`, icon: LuCheck },
    { label: "Review due", value: accountData.total_incomplete_flashcards, note: "Cards not remembered", icon: LuClock },
  ]
  const categories = [
    { label: "Kanji", value: accountData.total_kanji_flashcards, icon: LuBrain },
    { label: "Vocabulary", value: accountData.total_vocabulary_flashcards, icon: LuLanguages },
    { label: "Grammar", value: accountData.total_grammar_flashcards, icon: LuBookOpen },
  ]

  return (
    <FullScreenVSection gap={6}>
      <Box bg="bushido.surfaceContainer" borderRadius="4px" p={{ base: 5, md: 8 }}>
        <HStack gap={{ base: 4, md: 6 }} align="center">
          <Box boxSize={{ base: "72px", md: "96px" }} flexShrink={0} borderRadius="4px" borderWidth="3px" borderColor="bushido.primary" bg="white" display="grid" placeItems="center" color="bushido.primary" fontFamily="heading" fontSize={{ base: "28px", md: "36px" }} fontWeight="700">
            {initial}
          </Box>
          <VStack align="flex-start" gap={1} minW={0}>
            <Text fontFamily="mono" fontSize="12px" fontWeight="600" letterSpacing="0.05em" color="bushido.primary">FIGHTER PROFILE</Text>
            <Heading as="h1" fontSize={{ base: "24px", md: "32px" }} lineHeight={{ base: "32px", md: "40px" }}>{accountData.name}</Heading>
            <Text color="bushido.muted" truncate maxW="100%">{accountData.email}</Text>
            <HStack color="bushido.muted" fontSize="13px" gap={2}><LuCalendarDays /><Text>Member since {formatDate(accountData.account_created_at)}</Text></HStack>
          </VStack>
        </HStack>
      </Box>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4}>
        {stats.map(({ label, value = 0, note, icon: Icon }) => (
          <Box key={label} bg="white" borderWidth="1px" borderLeftWidth="3px" borderLeftColor="bushido.primary" borderRadius="4px" p={5} _hover={{"transform": "translateY(-1px)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}} transition="all .2s">
            <HStack justify="space-between" color="bushido.muted"><Text fontFamily="mono" fontSize="12px" letterSpacing="0.05em">{label.toUpperCase()}</Text><Icon /></HStack>
            <Text fontFamily="heading" fontSize="32px" lineHeight="40px" fontWeight="700" mt={3}>{value}</Text>
            <Text color="bushido.muted" fontSize="13px" mt={1}>{note}</Text>
          </Box>
        ))}
      </Box>

      <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" }} gap={6} alignItems="start">
        <Box bg="white" borderWidth="1px" borderRadius="4px" p={{ base: 5, md: 6 }} _hover={{"transform": "translateY(-1px)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}} transition="all .2s">
          <Heading as="h2" fontSize="20px" lineHeight="28px">Library progress</Heading>
          <Text color="bushido.muted" fontSize="14px" mt={1}>Breakdown of your {totalCards} flashcards</Text>
          <VStack align="stretch" gap={5} mt={6} >
            {categories.map(({ label, value = 0, icon: Icon }) => {
              const percentage = totalCards ? Math.round((value / totalCards) * 100) : 0
              return (
                <Box key={label} >
                  <HStack justify="space-between" mb={2}>
                    <HStack color="bushido.ink"><Icon /><Text fontWeight="600">{label}</Text></HStack>
                    <Text fontFamily="mono" fontSize="12px" color="bushido.muted">{value} CARDS · {percentage}%</Text>
                  </HStack>
                  <Box h="8px" bg="bushido.surfaceHighest" borderRadius="full" overflow="hidden"><Box h="100%" w={`${percentage}%`} bg="bushido.primary" borderRadius="full" /></Box>
                </Box>
              )
            })}
          </VStack>
        </Box>

        <VStack align="stretch" gap={4}>
          <Box bg="white" borderWidth="1px" borderRadius="4px" p={5} _hover={{"transform": "translateY(-1px)", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"}} transition="all .2s">
            <Heading as="h2" fontSize="20px" lineHeight="28px">Account</Heading>
            <VStack align="stretch" gap={4} mt={5}>
              <HStack align="flex-start"><Box color="bushido.primary" pt={1}><LuUserRound /></Box><Box minW={0}><Text fontSize="12px" fontFamily="mono" color="bushido.muted">EMAIL</Text><Text truncate>{accountData.email}</Text></Box></HStack>
              <HStack align="flex-start"><Box color="bushido.primary" pt={1}><LuClock /></Box><Box><Text fontSize="12px" fontFamily="mono" color="bushido.muted">LAST LOGIN</Text><Text>{formatDate(accountData.last_login)}</Text></Box></HStack>
            </VStack>
          </Box>
          <Button variant="outline" borderColor="bushido.error" color="bushido.error" borderRadius="8px" onClick={handleLogout} loading={isLoggingOut} loadingText="Logging out"><LuLogOut />Log out</Button>
        </VStack>
      </Box>
    </FullScreenVSection>
  )
}
