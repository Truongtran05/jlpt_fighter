import { Box, Heading, Text, VStack } from "@chakra-ui/react"

export default function Kanji({ kanji, onyomi = [], kunyomi = [], strokeCount, jlptLevel, meaning = [], ...props }) {
  return <Box {...props} bg="white" color="bushido.ink" borderWidth="1px" borderRadius="8px" p={6}><VStack gap={2} align="flex-start"><Heading as="h2" fontSize="45px" lineHeight="52px" color="bushido.primary">{kanji}</Heading><Text color="bushido.muted"><b>Onyomi</b> {onyomi.join(", ")}</Text><Text color="bushido.muted"><b>Kunyomi</b> {kunyomi.join(", ")}</Text></VStack><Text mt={4}><b>Stroke count</b> {strokeCount}</Text>{jlptLevel && <Text><b>JLPT level</b> N{jlptLevel}</Text>}<Text><b>Meaning</b> {meaning.join(", ")}</Text></Box>
}
