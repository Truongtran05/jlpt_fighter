import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function Vocabulary({ kanji = [], kana = [], meaning = [], ...props }) {
  const { t } = useLanguage()
  return <Box {...props} bg="white" color="bushido.ink" borderWidth="1px" borderRadius="4px" p={6}><VStack gap={2} align="flex-start">{kanji.map((item, index) => <Heading as="h2" fontFamily="body" fontSize="36px" lineHeight="44px" color="bushido.primary" key={`${item}-${index}`}>{item}</Heading>)}{kana.map((item, index) => <Text fontSize="18px" color="bushido.muted" key={`${item}-${index}`}>{item}</Text>)}</VStack><Text mt={4}><b>{t("Meaning")}</b> {meaning.join("; ")}</Text></Box>
}
