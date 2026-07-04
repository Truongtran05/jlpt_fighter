import { Heading, Text, VStack ,Box} from "@chakra-ui/react";

export default function Vocabulary({ kanji = [], kana = [], meaning = [], ...props }) {
  return (
    <Box {...props}>
      <VStack gap={4} align="center">
        {kanji.map((item, index) => (
          <Heading as="h3" size="4xl" key={`${item}-${index}`}>
            {item}
          </Heading>
        ))}
        {kana.map((item, index) => (
          <Text fontSize="2xl" key={`${item}-${index}`}>
            {item}
          </Text>
        ))}
      </VStack>
      <Text fontSize="2xl">Meaning: {meaning.join("; ")}</Text>
    </Box>
  )
}
