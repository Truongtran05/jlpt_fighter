import { Box, Heading, Text, VStack } from "@chakra-ui/react"

export default function Vocabulary({ kanji = [], kana = [], meaning = [], ...props }) {
  return <Box {...props} bg="white" color="bushido.ink" borderWidth="1px" borderRadius="8px" p={6}><VStack gap={2} align="flex-start">{kanji.map((item, index) => <Heading as="h2" fontSize="36px" lineHeight="44px" color="bushido.primary" key={`${item}-${index}`}>{item}</Heading>)}{kana.map((item, index) => <Text fontSize="18px" color="bushido.muted" key={`${item}-${index}`}>{item}</Text>)}</VStack><Text mt={4}><b>Meaning</b> {meaning.join("; ")}</Text></Box>
}
