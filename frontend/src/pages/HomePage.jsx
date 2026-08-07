import FullScreenVSection from "../layouts/FullScreenVSection"
import { Box, Button, Grid, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import logo from "../assets/jlpt_fighter_logo.png"
import { useLanguage } from "../contexts/LanguageContext.jsx"
import { getDictionaryStats } from "../api/services/DictionaryServices.js"

export default function HomePage() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDictionaryStats().then(({ data }) => setStats(data)).catch(() => setStats({}))
  }, [])

  const dictionaryStats = [
    [t("Vocabulary"), stats?.vocabulary],
    ["Kanji", stats?.kanji],
    [t("Grammar"), stats?.grammar],
  ]

  return (
    <FullScreenVSection justify="center">
      <VStack gap={8} align="flex-start" maxW="780px">
        <HStack gap={8} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
          <VStack gap={4} align="flex-start">
            <Text color="bushido.primary" fontWeight="600">{t("Forge your Japanese.")}</Text>
            <Heading as="h1" fontSize={{ base: "24px", md: "48px" }} lineHeight={{ base: "32px", md: "56px" }} letterSpacing={{ md: "-0.02em" }} fontWeight="700">{t("Master Japanese with focused practice.")}</Heading>
            <Text fontSize="16px" lineHeight="28px" color="bushido.muted" maxW="620px">{t("Search reliable language references, build personal flashcard sets, and prepare for the JLPT one deliberate session at a time.")}</Text>
          </VStack>
          <Image
            src={logo}
            alt="JLPT Fighter logo"
            w={{ base: "180px", md: "240px" }}
            h="auto"
            borderWidth="1px"
            borderColor="bushido.outlineVariant"
            borderRadius="4px"
          />
        </HStack>
        <HStack gap={3} wrap="wrap">
          <Button asChild bg="bushido.primary" color="white" borderRadius="8px" borderWidth="1px" borderColor="bushido.primary" _hover={{ bg: "bushido.primaryHover", borderWidth: "2px" }}><Link to="/learning">{t("Start learning")}</Link></Button>
          <Button asChild bg="transparent" color="bushido.ink" borderRadius="8px" borderWidth="1px" borderColor="bushido.outline" _hover={{ bg: "bushido.surfaceLow", borderColor: "bushido.primary" }}><Link to="/dictionary">{t("Open dictionary")}</Link></Button>
        </HStack>
        <Box w="100%" borderTopWidth="1px" pt={6}>
          <Text fontSize="14px" color="bushido.muted" mb={4}>{t("Dictionary at a glance")}</Text>
          <Grid templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }} gap={3}>
            {dictionaryStats.map(([label, value]) => (
              <Box key={label} bg="white" borderWidth="1px" borderColor="bushido.outlineVariant" borderRadius="4px" p={4}>
                <Text fontFamily="Space Grotesk" fontSize="20px" fontWeight="600">{value?.toLocaleString() ?? "—"}</Text>
                <Text fontSize="14px" color="bushido.muted">{label}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      </VStack>
    </FullScreenVSection>
  )
}
