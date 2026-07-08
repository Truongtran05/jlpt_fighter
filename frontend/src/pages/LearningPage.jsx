import FullScreenSection from "../layouts/FullScreenSection.jsx";
import { Box, Button, Heading, HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AuthApiClient from "../api/AuthApiClient.js";
import FlashCardSet from "../features/FlashCardSet.jsx";
import FlashCard from "../features/FlashCard.jsx";
import useSuggestions from "../hooks/UseSuggestions.jsx";

export default function LearningPage() {
    const [flashCardSets, setFlashCardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [flashCards, setFlashCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isNewSetFormOpen, setIsNewSetFormOpen] = useState(false);
    const [isNewCardFormOpen, setIsNewCardFormOpen] = useState(false);
    const [newSet, setNewSet] = useState({ name: "", description: "" });
    const [newCardQuery, setNewCardQuery] = useState("");
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const suggestions = useSuggestions(newCardQuery);

    useEffect(() => {
        const fetchFlashCardSets = async () => {
            try {
                const response = await AuthApiClient.get("/flashcard-sets/");
                setFlashCardSets(response.data);
            } catch (error) {
                console.error("Error fetching flash card sets:", error);
            }
        };

        fetchFlashCardSets();
    }, []);

    const loadFlashCards = async (flashCardSet) => {
        setFlashCards([]);
        setIsLoading(true);

        try {
            const response = await AuthApiClient.get(`/flashcard-sets/${flashCardSet.flash_card_set_id}/`);
            setFlashCards(response.data.flash_cards ?? []);
        } catch (error) {
            setError("Unable to load flash cards.");
            console.error("Error fetching flash cards:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectSet = async (flashCardSet) => {
        setSelectedSet(flashCardSet);
        setError(null);
        await loadFlashCards(flashCardSet);
    };

    const handleBackToSets = () => {
        setSelectedSet(null);
        setFlashCards([]);
        setError(null);
        setIsNewCardFormOpen(false);
    };

    const handleNewFlashCardSet = () => {
        setIsNewSetFormOpen(true);
        setError(null);
    };

    const handleSubmitNewFlashCardSet = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await AuthApiClient.post("/flashcard-sets/", {
                name: newSet.name.trim(),
                description: newSet.description.trim(),
            });
            setFlashCardSets((sets) => [...sets, response.data]);
            setNewSet({ name: "", description: "" });
            setIsNewSetFormOpen(false);
        } catch (error) {
            setError("Unable to create flashcard set.");
            console.error("Error creating flash card set:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewFlashCard = () => {
        setIsNewCardFormOpen(true);
        setNewCardQuery("");
        setSelectedSuggestion(null);
        setIsSuggestionsOpen(false);
        setError(null);
    }

    const handleSubmitNewFlashCard = async (event) => {
        event.preventDefault();
        if (!selectedSet || !selectedSuggestion) {
            setError("Choose a dictionary entry first.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await AuthApiClient.post(`/flashcard-sets/${selectedSet.flash_card_set_id}/flashcards/`, {
                type: selectedSuggestion.type,
                entry_id: selectedSuggestion.id,
            });
            setNewCardQuery("");
            setSelectedSuggestion(null);
            setIsNewCardFormOpen(false);
            setIsSuggestionsOpen(false);
            await loadFlashCards(selectedSet);
        } catch (error) {
            setError("Unable to create flashcard.");
            console.error("Error creating flash card:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewFlashCardChange = (event) => {
        const value = event.target.value;
        setNewCardQuery(value);
        setSelectedSuggestion(null);
        setIsSuggestionsOpen(!!value.trim());
    };

    return (
        <FullScreenSection
        backgroundColor="#14532d"
        isDarkBackground={true}
        gap={6} align="stretch" width="100%" paddingX={6} paddingTop="80px" justifyContent="center" overflowY="auto"
        >
        {selectedSet ? (
            <VStack align="stretch" gap={4}>
                {isNewCardFormOpen ? (
                    <VStack as="form" onSubmit={handleSubmitNewFlashCard} align="stretch" gap={3} position="relative">
                        <Input
                            name="content"
                            placeholder="Type your kanji/vocab/grammar term here..."
                            value={newCardQuery}
                            onChange={handleNewFlashCardChange}
                            backgroundColor="white"
                            color="gray.900"
                            required
                        />
                        {isSuggestionsOpen && suggestions.length > 0 && (
                            <VStack
                                align="stretch"
                                gap={0}
                                position="absolute"
                                top="42px"
                                left={0}
                                right={0}
                                overflowY="auto"
                                maxHeight="200px"
                                backgroundColor="white"
                                border="1px solid #ccc"
                                zIndex={1000}
                            >
                                {suggestions.map((suggestion) => (
                                    <Box
                                        key={`${suggestion.type}-${suggestion.id}-${suggestion.text}`}
                                        onClick={() => {
                                            setSelectedSuggestion(suggestion);
                                            setNewCardQuery(suggestion.text);
                                            setIsSuggestionsOpen(false);
                                        }}
                                        padding="8px"
                                        cursor="pointer"
                                        _hover={{ backgroundColor: 'gray.100' }}
                                    >
                                        <Text color="black">{suggestion.text}</Text>
                                        <Text color="gray.600" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
                                    </Box>
                                ))}
                            </VStack>
                        )}
                        {selectedSuggestion && (
                            <Text color="green.100">
                                Selected {selectedSuggestion.type}: {selectedSuggestion.text}
                            </Text>
                        )}
                        
                        <HStack>
                            <Button type="submit" loading={isLoading} loadingText="Creating" disabled={!selectedSuggestion}>
                                Create FlashCard
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setIsNewCardFormOpen(false)}>
                                Cancel
                            </Button>
                        </HStack>
                    </VStack>
                    ) :(
                        <HStack justifyContent="space-between" alignItems="center">
                            <Button alignSelf="flex-start" onClick={handleBackToSets}>
                                Back to flashcard sets
                            </Button>
                            <Button alignSelf="flex-end" onClick={handleNewFlashCard}>
                                New FlashCard
                            </Button>
                        </HStack>
                    )}
                <Heading size="lg">{selectedSet.name}</Heading>
                {selectedSet.description && <Text>{selectedSet.description}</Text>}
                {isLoading && <Text>Loading flash cards...</Text>}
                {error && <Text color="red.200">{error}</Text>}
                {!isLoading && !error && flashCards.length === 0 && (
                    <Text>This set has no flash cards.</Text>
                )}
                {
                <VStack align="center" gap={4}>
                {!isLoading && !error && flashCards.map((flashCard) => (
                    <FlashCard key={flashCard.flash_card_id} flashCard={flashCard} />
                ))}
                </VStack>
                }
            </VStack>
        ) : (
            <VStack align="stretch" gap={4}>
            <HStack justifyContent="space-between" alignItems="center">
                <Text as="h1" fontSize="2xl" fontWeight="bold">
                    My Flashcard sets
                </Text>
                <Button onClick={handleNewFlashCardSet}>New Flashcard Set</Button>
            </HStack>
            {isNewSetFormOpen && (
                <VStack as="form" onSubmit={handleSubmitNewFlashCardSet} align="stretch" gap={3}>
                    <Input
                        name="name"
                        placeholder="Name"
                        value={newSet.name}
                        onChange={(event) => setNewSet((set) => ({ ...set, name: event.target.value }))}
                        backgroundColor="white"
                        color="gray.900"
                        required
                    />
                    <Textarea
                        name="description"
                        placeholder="Description"
                        value={newSet.description}
                        onChange={(event) => setNewSet((set) => ({ ...set, description: event.target.value }))}
                        backgroundColor="white"
                        color="gray.900"
                    />
                    <HStack>
                        <Button type="submit" loading={isLoading} loadingText="Creating">
                            Submit
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsNewSetFormOpen(false)}>
                            Cancel
                        </Button>
                    </HStack>
                </VStack>
            )}
            {error && <Text color="red.200">{error}</Text>}
            {flashCardSets.map((flashCardSet) => (
                <FlashCardSet
                    key={flashCardSet.flash_card_set_id}
                    flashCardSet={flashCardSet}
                    onClick={handleSelectSet}
                />
            ))}
            </VStack>
        )}
        </FullScreenSection>
    );
}
