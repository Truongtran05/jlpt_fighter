import {Box, VStack, Text, Heading } from "@chakra-ui/react";

export default function Grammar({grammar, formation, meaning, jlpt_level, examples, ...props}) {
    return (
        <Box {...props}>
            <VStack spacing={4} align="center">
                <Heading as="h1" fontSize="4xl">
                    {grammar}
                </Heading>
                <Text fontSize="2xl">Formation: {formation}</Text>
            </VStack>
            { jlpt_level && <Text fontSize="2xl">JLPT Level: N{jlpt_level}</Text> }
            <Text fontSize="2xl">Meaning: {meaning}</Text>
            <VStack spacing={4} align="center">
                {examples.map((example) => (
                    <Box key={example.id} backgroundColor="whiteAlpha.200" borderRadius="md" padding={6} width="100%">
                        <Text fontSize="2xl">Examples:</Text>
                        <Text fontSize="xl">{example.example_japanese}</Text>
                        <Text fontSize="sm">{example.example_romaji}</Text>
                        <Text fontSize="lg">{example.example_english}</Text>
                    </Box>
                ))}
            </VStack>
        </Box>
    )
}