import FullScreenVSection from "../layouts/FullScreenVSection.jsx";
import { Box, Button, Heading, HStack, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import AuthApiClient from "../api/clients/AuthApiClient.js";
import FlashCardSet from "../features/FlashCardSet.jsx";
import FlashCard from "../features/FlashCard.jsx";
import useSuggestions from "../hooks/UseSuggestions.jsx";
import FlashCardCarousel from "../features/FlashCardCarousel.jsx";
import { MdDelete } from "react-icons/md";
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
        _hover: { bg: "bushido.primaryHover", transform: "translateY(-1px)" },
    };
    const secondaryButtonStyles = {
        bg: "bushido.secondarySoft",
        color: "#0a1f15",
        borderRadius: "8px",
        _hover: { bg: "bushido.primarySoft" },
    };
    const destructiveButtonStyles = {
        bg: "bushido.error",
        color: "white",
        borderRadius: "8px",
        _hover: { bg: "#8f1414", transform: "translateY(-1px)" },
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
        gap={6} align="stretch" width="100%" paddingX={6} justifyContent="flex-start" overflowY="auto"
        >
            {isLearningSessionActive ? (
                <VStack align="center" gap={4}>
                    <Heading size="lg" color="bushido.ink">Learning Session</Heading>
                    <Button {...secondaryButtonStyles} onClick={() => setIsLearningSessionActive(false)}>End Session</Button>
                    {isLoading && <Text color="bushido.muted">Loading flash cards...</Text>}
                    {error && <Text color="bushido.error">{error}</Text>}
                    <FlashCardCarousel flashCards={flashCards} onStatusUpdated={handleFlashCardUpdated} />
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
                        <VStack align="stretch" gap={2}>
                            <Heading size="lg">{selectedSet.name}<FaEdit onClick={() => setIsEditingSet(true)} size={20} color="gray.400" /></Heading>
                            {selectedSet.description && <Text>{selectedSet.description}</Text>}
                            {isLoading && <Text>Loading flash cards...</Text>}
                            {error && <Text color="bushido.error">{error}</Text>}
                            {!isLoading && !error && flashCards.length === 0 && (
                                <Text>This set has no flash cards.</Text>
                            )}
                        </VStack>
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
                                width="20%"
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
                                    width="20%"
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
                                            <Text color="bushido.muted" fontSize="sm">{(suggestion.meaning ?? []).join(", ")}</Text>
                                        </Box>
                                    ))}
                                </VStack>
                            )}
                            {selectedSuggestion && (
                                <Text color="#171d1a">
                                    Selected {selectedSuggestion.type}: {selectedSuggestion.text}
                                </Text>
                            )}
                            
                            <HStack>
                                <Button {...primaryButtonStyles} type="submit" loading={isLoading} loadingText="Creating" disabled={!selectedSuggestion}>
                                    Create FlashCard
                                </Button>
                                <Button {...secondaryButtonStyles} type="button" onClick={() => setIsNewCardFormOpen(false)}>
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                        ) :(
                            <HStack justifyContent="space-between" alignItems="center">
                                <Button {...secondaryButtonStyles} alignSelf="flex-start" onClick={handleBackToSets}>
                                    Back to flashcard sets
                                </Button>
                                <Button {...primaryButtonStyles} type="button" alignSelf="center" onClick={handleStartLearning}>
                                    StartLearning
                                </Button>
                                <Button {...primaryButtonStyles} alignSelf="flex-end" onClick={handleNewFlashCard}>
                                    New FlashCard
                                </Button>
                            </HStack>
                        )}
                    {
                    <VStack align="center" gap={4}>
                    <HStack justify="center" gap = {4}>
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
                                isEditable={isEditingSet}
                            />
                            {isEditingSet && (
                            <Button {...destructiveButtonStyles} onClick={() => handleDeleteFlashCard(flashCard.flash_card_id)}>
                                <MdDelete />
                            </Button>
                            )}
                        </HStack>
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
                    <Button {...primaryButtonStyles} onClick={handleNewFlashCardSet}>New Flashcard Set</Button>
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
                            width="20%"
                            required
                        />
                        <Textarea
                            name="description"
                            placeholder="Description"
                            value={newSet.description}
                            onChange={(event) => setNewSet((set) => ({ ...set, description: event.target.value }))}
                            backgroundColor="white"
                            width="20%"
                            color="gray.900"
                        />
                        <HStack>
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
                {flashCardSets.map((flashCardSet) => (
                    <FlashCardSet
                        key={flashCardSet.flash_card_set_id}
                        flashCardSet={flashCardSet}
                        onClick={handleSelectSet}
                    />
                ))}
                </VStack>
            )
            )}
        </FullScreenVSection>
    );
}
