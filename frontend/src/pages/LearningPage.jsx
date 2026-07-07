import FullScreenSection from "../layouts/FullScreenSection.jsx";
import { Button, Heading, HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AuthApiClient from "../api/AuthApiClient.js";
import FlashCardSet from "../features/FlashCardSet.jsx";
import FlashCard from "../features/FlashCard.jsx";

export default function LearningPage() {
    const [flashCardSets, setFlashCardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [flashCards, setFlashCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isNewSetFormOpen, setIsNewSetFormOpen] = useState(false);
    const [newSet, setNewSet] = useState({ name: "", description: "" });

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

    const handleSelectSet = async (flashCardSet) => {
        setSelectedSet(flashCardSet);
        setFlashCards([]);
        setError(null);
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

    const handleBackToSets = () => {
        setSelectedSet(null);
        setFlashCards([]);
        setError(null);
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

    return (
        <FullScreenSection
        backgroundColor="#14532d"
        isDarkBackground={true}
        gap={6} align="stretch" width="100%" paddingX={6} paddingTop="80px" justifyContent="center" overflowY="auto"
        >
        {selectedSet ? (
            <VStack align="stretch" gap={4}>
                <Button alignSelf="flex-start" onClick={handleBackToSets}>
                    Back to flashcard sets
                </Button>
                <Heading size="lg">{selectedSet.name}</Heading>
                {selectedSet.description && <Text>{selectedSet.description}</Text>}
                {isLoading && <Text>Loading flash cards...</Text>}
                {error && <Text color="red.200">{error}</Text>}
                {!isLoading && !error && flashCards.length === 0 && (
                    <Text>This set has no flash cards.</Text>
                )}
                {!isLoading && !error && flashCards.map((flashCard) => (
                    <FlashCard key={flashCard.flash_card_id} flashCard={flashCard} />
                ))}
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
