import {Box, VStack, Text, Heading } from "@chakra-ui/react";

export default function Kanji({kanji, onyomi = [], kunyomi = [], strokeCount, jlptLevel, meaning = [],...props}) {
    return (
        <Box {...props}>
            <VStack spacing={4} align="center">
                <Heading as="h1" fontSize="4xl">
                    {kanji}
                </Heading>
                <Text fontSize="2xl">Onyomi: {onyomi.join(", ")}</Text>
                <Text fontSize="2xl">Kunyomi: {kunyomi.join(", ")}</Text>
            </VStack>
            <Text fontSize="2xl">Stroke Count: {strokeCount}</Text>
            { jlptLevel && <Text fontSize="2xl">JLPT Level: N{jlptLevel}</Text> }
            <Text fontSize="2xl">Meaning: {meaning.join(", ")}</Text>
        </Box>
    )
}