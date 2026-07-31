import FullScreenVSection from "../layouts/FullScreenVSection.jsx";
import { Box, Button, Heading, HStack, Input, Text, Textarea, VStack , SimpleGrid} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AuthApiClient from "../api/clients/AuthApiClient.js";
import FlashCardSet from "../features/FlashCardSet.jsx";
import FlashCard from "../features/FlashCard.jsx";
import useSuggestions from "../hooks/UseSuggestions.jsx";
import FlashCardCarousel from "../features/FlashCardCarousel.jsx";
import { FaEdit } from "react-icons/fa";
import {getStoredUser} from "../utils/AuthStorage.js"
import { useNavigate } from "react-router-dom";
import { toaster } from "../components/ui/toaster.jsx";

export default function LearningPage() {
    const navigate = useNavigate();
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
    const [isEditingSet, setIsEditingSet] = useState(false);
    const [isLearningSessionActive, setIsLearningSessionActive] = useState(false);
    const suggestions = useSuggestions(newCardQuery);
    const currentUser = getStoredUser();
    const [currentCardMode, setCurrentCardMode] = useState("all"); // "all", "remembered", "forgotten"
    const primaryButtonStyles = {
        bg: "bushido.primary",
        color: "white",
        borderRadius: "8px",
        borderWidth: "1px",
        borderColor: "bushido.primary",
        _hover: { bg: "bushido.primaryHover", borderWidth: "2px" },
    };
    const secondaryButtonStyles = {
        bg: "transparent",
        color: "bushido.ink",
        borderRadius: "8px",
        borderWidth: "1px",
        borderColor: "bushido.outline",
        _hover: { bg: "bushido.surfaceLow", borderColor: "bushido.primary" },
    };
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

    useEffect(() => {
        if(!currentUser) {
            toaster.create({
                title: "Login required",
                description: "Please log in to access your flashcard sets.",
                type: "warning",
            });
            navigate("/login");
        }
    }, [currentUser, navigate]);

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
        if(!currentUser) {
            toaster.create({
                title: "Login required",
                description: "Please log in before creating a new flashcard set.",
                type: "warning",
            });
            navigate("/login");
            return;
        }
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

    const handleEditFlashCardSet = async (e,updatedSet) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.target);
        try{
            const response = await AuthApiClient.patch(`/flashcard-sets/${updatedSet.flash_card_set_id}/`, {
                name: formData.get("name").trim(),
                description: formData.get("description").trim()
            });

            const updatedSetData = response.data;
            setSelectedSet(updatedSetData);
            setFlashCardSets((sets) => sets.map((set) => set.flash_card_set_id === updatedSet.flash_card_set_id ? response.data : set));
            setIsEditingSet(false);
        } catch (error) {
            setError("Unable to update flashcard set.");
            console.error("Error updating flash card set:", error);
        } finally{
            setIsEditingSet(false);
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

        try {
            const response = await AuthApiClient.post(`/flashcard-sets/${selectedSet.flash_card_set_id}/flashcards/`, {
                type: selectedSuggestion.type,
                entry_id: selectedSuggestion.id,
            });
            setFlashCards((cards) => [
                ...cards,
                response.data,
            ]);
            setNewCardQuery("");
            setSelectedSuggestion(null);
            setIsNewCardFormOpen(false);
            setIsSuggestionsOpen(false);
        } catch (error) {
            setError("Unable to create flashcard.");
            console.error("Error creating flash card:", error);
        }
    };

    const handleFlashCardUpdated = (updatedFlashCard) => {
        setFlashCards((cards) => cards.map((card) => (
            card.flash_card_id === updatedFlashCard.flash_card_id ? updatedFlashCard : card
        )));
    };

    const handleNewFlashCardChange = (event) => {
        const value = event.target.value;
        setNewCardQuery(value);
        setSelectedSuggestion(null);
        setIsSuggestionsOpen(!!value.trim());
    };

    const handleStartLearning = () => {
        setIsLearningSessionActive(true);
    }

    const handleDeleteFlashCard = async (flashCardId) => {
        try {
            await AuthApiClient.delete(`/flashcards/${flashCardId}/`);
            setFlashCards((cards) => cards.filter((card) => card.flash_card_id !== flashCardId));
        } catch (error) {
            console.error("Error deleting flash card:", error);
        }
    };


    return (
        <FullScreenVSection
        backgroundColor="bushido.surface"
        isDarkBackground={true}
        gap={6} align="stretch" width="100%" paddingX={{ base: 4, md: 6 }} justifyContent="flex-start" overflowY="auto"
        >
            {isLearningSessionActive ? (
                <VStack align="center" gap={4}>
                    <Heading size="lg" color="bushido.ink">Learning Session</Heading>
                    <Button {...secondaryButtonStyles} onClick={() => setIsLearningSessionActive(false)}>End Session</Button>
                    {isLoading && <Text color="bushido.muted">Loading flash cards...</Text>}
                    {error && <Text color="bushido.error">{error}</Text>}
                    <FlashCardCarousel flashCards={flashCards} onStatusUpdated={handleFlashCardUpdated} onEndSession={() => setIsLearningSessionActive(false)} />
                </VStack>
            ) : (
            selectedSet ? (
                <VStack align="stretch" gap={4}>
                    {isEditingSet ? (
                        <VStack 
                            as="form" 
                            onSubmit={(e) => handleEditFlashCardSet(e, selectedSet)} 
                            align="stretch" 
                            gap={3}
                            width="100%"
                            maxWidth="300px"
                        >
                            <Input
                                name="name"
                                placeholder="Set name"
                                defaultValue={selectedSet.name}
                            />
                            <Input
                                name="description"
                                placeholder="Set description"
                                defaultValue={selectedSet.description}
                            />
                            <HStack>
                                <Button {...primaryButtonStyles} type="submit">Save Changes</Button>
                                <Button {...secondaryButtonStyles} type="button" onClick={() => setIsEditingSet(false)}>
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    ) : (
                        <HStack position="relative" width="100%" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "stretch", md: "center" }}>
                        <VStack align="stretch" alignSelf={{ base: "stretch", md: "flex-end" }} maxWidth={{ base: "100%", md: "fit-content" }} margin={{ base: 0, md: "20px" }} backgroundColor="bushido.surfaceLow" padding={4} borderWidth="1px" borderRadius="4px">
                            <HStack justifyContent="left" alignItems="center">
                                <Heading size="lg">{selectedSet.name}</Heading>
                                <FaEdit onClick={() => setIsEditingSet(true)} size={20} color="gray.400" />
                            </HStack>
                            {selectedSet.description && <Text>{selectedSet.description}</Text>}
                            {isLoading && <Text>Loading flash cards...</Text>}
                            {error && <Text color="bushido.error">{error}</Text>}
                            {!isLoading && !error && flashCards.length === 0 && (
                                <Text>This set has no flash cards.</Text>
                            )}
                            {!isLoading && !error && (
                                <HStack gap={{ base: 4, sm: 6 }} flexWrap="wrap" pt={2} borderTopWidth="1px" borderColor="bushido.outlineVariant">
                                    {[
                                        ["Total", flashCards.length, "bushido.ink"],
                                        ["Remembered", flashCards.filter((card) => card.status === "remembered").length, "bushido.primary"],
                                        ["Forgotten", flashCards.filter((card) => card.status === "forgotten").length, "bushido.tertiary"],
                                    ].map(([label, value, color]) => (
                                        <VStack key={label} align="flex-start" gap={0}>
                                            <Text fontFamily="mono" fontSize="12px" color="bushido.muted">{label}</Text>
                                            <Text fontFamily="heading" fontSize="20px" fontWeight="600" color={color}>{value}</Text>
                                        </VStack>
                                    ))}
                                </HStack>
                            )}
                        </VStack>
                        <Button {...primaryButtonStyles} type="button" position={{ base: "static", md: "absolute" }} left={{ md: "50%" }} transform={{ md: "translateX(-50%)" }} width={{ base: "100%", md: "auto" }} onClick={handleStartLearning}>
                            Practice !
                        </Button>
                        </HStack>
                    )}
                    {isNewCardFormOpen ? (
                        <VStack as="form" onSubmit={handleSubmitNewFlashCard} align="stretch" gap={3} position="relative">
                            <Input
                                name="content"
                                placeholder="Type your kanji/vocab/grammar term here..."
                                value={newCardQuery}
                                onChange={handleNewFlashCardChange}
                                backgroundColor="white"
                                color="gray.900"
                                width={{ base: "100%", md: "320px" }}
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
                                    width={{ base: "100%", md: "320px" }}
                                    borderWidth="1px"
                                    borderColor="bushido.outline"
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
                                            _hover={{ backgroundColor: 'bushido.surfaceLow' }}
                                        >
                                            <Text color="black">{suggestion.text}</Text>
                                            <Text color="bushido.muted" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                            {selectedSuggestion && (
                                <Text color="bushido.ink">
                                    Selected {selectedSuggestion.type}: {selectedSuggestion.text}
                                </Text>
                            )}
                            
                            <HStack flexWrap="wrap">
                                <Button {...primaryButtonStyles} type="submit" loading={isLoading} loadingText="Creating" disabled={!selectedSuggestion}>
                                    Create FlashCard
                                </Button>
                                <Button {...secondaryButtonStyles} type="button" onClick={() => setIsNewCardFormOpen(false)}>
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                        ) :(
                            <HStack justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }} flexDirection={{ base: "column", lg: "row" }}>
                                <Button {...secondaryButtonStyles} width={{ base: "100%", sm: "auto" }} alignSelf={{ base: "stretch", sm: "flex-start" }} onClick={handleBackToSets}>
                                    Back to flashcard sets
                                </Button>
                            <HStack justify="center" gap={{ base: 2, sm: 4 }} flexWrap="wrap">
                                <Button
                                    {...(currentCardMode === "remembered" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("remembered")}
                                >
                                    Remembered
                                </Button>
                                <Button
                                    {...(currentCardMode === "all" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("all")}
                                >
                                    All
                                </Button>
                                <Button
                                    {...(currentCardMode === "forgotten" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("forgotten")}
                                >
                                    Forgotten
                                </Button>
                            </HStack>
                                <Button {...primaryButtonStyles} width={{ base: "100%", sm: "auto" }} alignSelf={{ base: "stretch", sm: "flex-end" }} onClick={handleNewFlashCard}>
                                    New FlashCard
                                </Button>
                            </HStack>
                        )}
                    {
                    <VStack align="center" gap={4}>
                    {!isLoading && !error && flashCards.filter((flashCard) => {
                        if (currentCardMode === "remembered") {
                            return flashCard.status === "remembered";
                        }
                        if (currentCardMode === "forgotten") {
                            return flashCard.status === "forgotten";
                        }
                        return true;
                    }).map((flashCard) => (
                        <HStack key={flashCard.flash_card_id} align="center" justify="center" gap={4} width="100%">
                            <FlashCard
                                flashCard={flashCard}
                                onUpdated={handleFlashCardUpdated}
                                onDelete={() => handleDeleteFlashCard(flashCard.flash_card_id)}
                                isEditable={!isLearningSessionActive}
                            />
                        </HStack>
                    ))}
                    </VStack>
                    }
                </VStack>
            ) : (
                <VStack align="stretch" gap={4}>
                <HStack justifyContent="space-between" alignItems={{ base: "stretch", sm: "center" }} flexDirection={{ base: "column", sm: "row" }}>
                    <Text as="h1" fontSize="2xl" fontWeight="bold">
                        My Flashcard sets 
                    </Text>
                    <Button {...primaryButtonStyles} width={{ base: "100%", sm: "auto" }} onClick={handleNewFlashCardSet}>New Flashcard Set</Button>
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
                            width={{ base: "100%", md: "320px" }}
                            required
                        />
                        <Textarea
                            name="description"
                            placeholder="Description"
                            value={newSet.description}
                            onChange={(event) => setNewSet((set) => ({ ...set, description: event.target.value }))}
                            backgroundColor="white"
                            width={{ base: "100%", md: "320px" }}
                            color="gray.900"
                        />
                        <HStack flexWrap="wrap">
                            <Button {...primaryButtonStyles} type="submit" loading={isLoading} loadingText="Creating">
                                Submit
                            </Button>
                            <Button {...secondaryButtonStyles} type="button" onClick={() => setIsNewSetFormOpen(false)}>
                                Cancel
                            </Button>
                        </HStack>
                    </VStack>
                )}
                {error && <Text color="bushido.error">{error}</Text>}
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4} gridAutoRows="1fr">
                {flashCardSets.map((flashCardSet) => (
                    <FlashCardSet
                        key={flashCardSet.flash_card_set_id}
                        flashCardSet={flashCardSet}
                        onClick={handleSelectSet}
                    />
                ))}
                </SimpleGrid>
                </VStack>
            )
            )}
        </FullScreenVSection>
    );
}
