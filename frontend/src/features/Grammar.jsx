import {Box, VStack, Text, Heading } from "@chakra-ui/react";
import { useLanguage } from "../contexts/LanguageContext.jsx";

export default function Grammar({grammar, formation, meaning, jlpt_level, examples = [], ...props}) {
    const { t } = useLanguage();
    return (
        <Box {...props}>
            <VStack spacing={4} align="center">
                <Heading as="h1" fontSize="4xl">
                    {grammar}
                </Heading>
                <Text fontSize="2xl">{t("Formation")}: {formation}</Text>
            </VStack>
            { jlpt_level && <Text fontSize="2xl">{t("JLPT Level")}: N{jlpt_level}</Text> }
            <Text fontSize="2xl">{t("Meaning")}: {meaning}</Text>
            <VStack spacing={4} align="center">
                {examples.map((example, index) => (
                    <Box key={`${example.example_japanese}-${index}`} backgroundColor="white" borderWidth="1px" borderRadius="4px" padding={6} width="100%">
                        <Text fontSize="2xl">{t("Examples")}:</Text>
                        <Text fontSize="xl">{example.example_japanese}</Text>
                        <Text fontSize="sm">{example.example_romaji}</Text>
                        <Text fontSize="lg">{example.example_gloss ?? example.example_english}</Text>
                    </Box>
                ))}
            </VStack>
        </Box>
    )
}
