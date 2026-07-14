import FullScreenVSection from "../layouts/FullScreenVSection"
import { Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <FullScreenVSection justify="center">
      <VStack gap={8} align="flex-start" maxW="780px">
        <Text color="bushido.primary" fontWeight="600">日本語を鍛える</Text>
        <Heading as="h1" fontSize={{ base: "45px", md: "57px" }} lineHeight={{ base: "52px", md: "64px" }} fontWeight="700">Master Japanese with focused practice.</Heading>
        <Text fontSize="18px" lineHeight="28px" color="bushido.muted" maxW="620px">Search reliable language references, build personal flashcard sets, and prepare for the JLPT one deliberate session at a time.</Text>
        <HStack gap={3} wrap="wrap">
          <Button asChild bg="bushido.primary" color="white" borderRadius="8px" _hover={{ bg: "bushido.primaryHover", transform: "translateY(-1px)" }}><Link to="/learning">Start learning</Link></Button>
          <Button asChild bg="bushido.secondarySoft" color="#0a1f15" borderRadius="8px" _hover={{ bg: "bushido.primarySoft" }}><Link to="/vocab">Explore vocabulary</Link></Button>
        </HStack>
        <Box w="100%" borderTopWidth="1px" pt={6}><Text fontSize="14px" color="bushido.muted">Kanji · Vocabulary · Grammar · Personal flashcards</Text></Box>
      </VStack>
    </FullScreenVSection>
  )
}
