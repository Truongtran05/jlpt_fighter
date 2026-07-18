import FullScreenVSection from "../layouts/FullScreenVSection"
import { Box, Button, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import logo from "../assets/jlpt_fighter_logo.png"

export default function HomePage() {
  return (
    <FullScreenVSection justify="center">
      <VStack gap={8} align="flex-start" maxW="780px">
        <HStack gap={8} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
          <VStack gap={4} align="flex-start">
            <Text color="bushido.primary" fontWeight="600">日本語を鍛える</Text>
            <Heading as="h1" fontSize={{ base: "45px", md: "57px" }} lineHeight={{ base: "52px", md: "64px" }} fontWeight="700">Master Japanese with focused practice.</Heading>
            <Text fontSize="18px" lineHeight="28px" color="bushido.muted" maxW="620px">Search reliable language references, build personal flashcard sets, and prepare for the JLPT one deliberate session at a time.</Text>
          </VStack>
          <Image
            src={logo}
            alt="JLPT Fighter logo"
            w={{ base: "180px", md: "240px" }}
            h="auto"
            boxShadow="0 12px 28px rgba(30, 95, 65, 0.18)"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "0 18px 36px rgba(30, 95, 65, 0.26)",
            }}
          />
        </HStack>
        <HStack gap={3} wrap="wrap">
          <Button asChild bg="bushido.primary" color="white" borderRadius="8px" _hover={{ bg: "bushido.primaryHover", transform: "translateY(-1px)" }}><Link to="/learning">Start learning</Link></Button>
          <Button asChild bg="bushido.secondarySoft" color="#0a1f15" borderRadius="8px" _hover={{ bg: "bushido.primarySoft" }}><Link to="/explore">Explore vocabulary</Link></Button>
        </HStack>
        <Box w="100%" borderTopWidth="1px" pt={6}><Text fontSize="14px" color="bushido.muted">Kanji · Vocabulary · Grammar · Personal flashcards</Text></Box>
      </VStack>
    </FullScreenVSection>
  )
}
