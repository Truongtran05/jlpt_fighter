import FullScreenVSection from "../layouts/FullScreenVSection"
import { Box, Button, Heading, HStack, Image, Switch, Text, VStack } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import logo from "../assets/jlpt_fighter_logo.png"
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function HomePage() {
  const { t } = useLanguage()
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
          <Button asChild bg="transparent" color="bushido.ink" borderRadius="8px" borderWidth="1px" borderColor="bushido.outline" _hover={{ bg: "bushido.surfaceLow", borderColor: "bushido.primary" }}><Link to="/explore">{t("Explore vocabulary")}</Link></Button>
        </HStack>
        <Box w="100%" borderTopWidth="1px" pt={6}><Text fontSize="14px" color="bushido.muted">{t("Kanji · Vocabulary · Grammar · Personal flashcards")}</Text></Box>
      </VStack>
    </FullScreenVSection>
  )
}
