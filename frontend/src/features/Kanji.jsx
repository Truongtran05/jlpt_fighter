import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { useLanguage } from "../contexts/LanguageContext.jsx"

export default function Kanji({ kanji, onyomi = [], kunyomi = [], strokeCount, jlptLevel, meaning = [], ...props }) {
  const { t } = useLanguage()
  return <Box 
          {...props} 
          bg="white" 
          color="bushido.ink" 
          borderWidth="1px" 
          borderRadius="4px"
          p={6}>
            <VStack 
            gap={2} 
            align="flex-start">
              <Heading 
              as="h2" 
              fontFamily="body"
              fontSize="45px" 
              lineHeight="52px" 
              color="bushido.primary">
                {kanji}
              </Heading>
              <Text 
              color="bushido.muted">
                <b>Onyomi</b> {onyomi.join(", ")}
              </Text>
              <Text color="bushido.muted">
                <b>Kunyomi</b> {kunyomi.join(", ")}
              </Text>
            </VStack>
            <Text mt={4}><b>{t("Stroke count")}</b> {strokeCount}</Text>
            {jlptLevel > 0  && <Text><b>{t("JLPT level")}</b> N{jlptLevel}</Text>}
            <Text><b>{t("Meaning")}</b> {meaning.join(", ")}</Text>
      </Box>
}
