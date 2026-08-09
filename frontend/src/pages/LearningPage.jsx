import FullScreenVSection from "../layouts/FullScreenVSection.jsx";
import { Box, Button, Dialog, Heading, HStack, IconButton, Input, Portal, SimpleGrid, Text, Textarea, VStack } from "@chakra-ui/react";
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
import { useLanguage } from "../contexts/LanguageContext.jsx";
import SuggestionList from "../components/SuggestionList.jsx";

export default function LearningPage() {
    const { language, t } = useLanguage();
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);
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
                title: t("Login required"),
                description: t("Please log in to access your flashcard sets."),
                type: "warning",
            });
            navigate("/login");
        }
    }, [currentUser, navigate, t]);

    const loadFlashCards = async (flashCardSet) => {
        setFlashCards([]);
        setIsLoading(true);

        try {
            const response = await AuthApiClient.get(`/flashcard-sets/${flashCardSet.flash_card_set_id}/`, {
                params: { lang: language },
            });
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
                title: t("Login required"),
                description: t("Please log in before creating a new flashcard set."),
                type: "warning",
            });
            navigate("/login");
            return;
        }
        setIsNewSetFormOpen(true);
        setFormError(null);
        setError(null);
    };

    const closeNewSetForm = () => {
        if (isSubmitting) return;
        setIsNewSetFormOpen(false);
        setNewSet({ name: "", description: "" });
        setFormError(null);
    };

    const handleSubmitNewFlashCardSet = async (event) => {
        event.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        try {
            const response = await AuthApiClient.post("/flashcard-sets/", {
                name: newSet.name.trim(),
                description: newSet.description.trim(),
            });
            setFlashCardSets((sets) => [...sets, response.data]);
            setNewSet({ name: "", description: "" });
            setIsNewSetFormOpen(false);
        } catch (error) {
            setFormError("Unable to create flashcard set.");
            console.error("Error creating flash card set:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditFlashCardSet = async (e,updatedSet) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
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
            setFormError("Unable to update flashcard set.");
            console.error("Error updating flash card set:", error);
        } finally{
            setIsSubmitting(false);
        }
    };

    const handleEditFlashCardSetOpen = () => {
        setFormError(null);
        setIsEditingSet(true);
    };

    const closeEditSetForm = () => {
        if (isSubmitting) return;
        setIsEditingSet(false);
        setFormError(null);
    };

    const handleNewFlashCard = () => {
        setIsNewCardFormOpen(true);
        setNewCardQuery("");
        setSelectedSuggestion(null);
        setIsSuggestionsOpen(false);
        setFormError(null);
        setError(null);
    }

    const closeNewCardForm = () => {
        if (isSubmitting) return;
        setIsNewCardFormOpen(false);
        setNewCardQuery("");
        setSelectedSuggestion(null);
        setIsSuggestionsOpen(false);
        setFormError(null);
    };

    const handleSubmitNewFlashCard = async (event) => {
        event.preventDefault();
        if (!selectedSet || !selectedSuggestion) {
            setFormError("Choose a dictionary entry first.");
            return;
        }

        setFormError(null);
        setIsSubmitting(true);

        try {
            const response = await AuthApiClient.post(`/flashcard-sets/${selectedSet.flash_card_set_id}/flashcards/`, {
                type: selectedSuggestion.type,
                entry_id: selectedSuggestion.id,
            }, { params: { lang: language } });
            setFlashCards((cards) => [
                ...cards,
                response.data,
            ]);
            setNewCardQuery("");
            setSelectedSuggestion(null);
            setIsNewCardFormOpen(false);
            setIsSuggestionsOpen(false);
        } catch (error) {
            setFormError("Unable to create flashcard.");
            console.error("Error creating flash card:", error);
        } finally {
            setIsSubmitting(false);
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
                    <Heading size="lg" color="bushido.ink">{t("Learning Session")}</Heading>
                    <Button {...secondaryButtonStyles} onClick={() => setIsLearningSessionActive(false)}>{t("End Session")}</Button>
                    {isLoading && <Text color="bushido.muted">{t("Loading flash cards...")}</Text>}
                    {error && <Text color="bushido.error">{t(error)}</Text>}
                    <FlashCardCarousel flashCards={flashCards} onStatusUpdated={handleFlashCardUpdated} onEndSession={() => setIsLearningSessionActive(false)} />
                </VStack>
            ) : (
            selectedSet ? (
                <VStack align="stretch" gap={4}>
                    <HStack position="relative" width="100%" flexDirection={{ base: "column", md: "row" }} alignItems={{ base: "stretch", md: "center" }}>
                        <VStack align="stretch" alignSelf={{ base: "stretch", md: "flex-end" }} maxWidth={{ base: "100%", md: "fit-content" }} margin={{ base: 0, md: "20px" }} backgroundColor="bushido.surfaceLow" padding={4} borderWidth="1px" borderRadius="4px">
                            <HStack justifyContent="left" alignItems="center">
                                <Heading size="lg">{selectedSet.name}</Heading>
                                <IconButton size="sm" variant="ghost" aria-label={t("Edit Flashcard Set")} onClick={handleEditFlashCardSetOpen}>
                                    <FaEdit />
                                </IconButton>
                            </HStack>
                            {selectedSet.description && <Text>{selectedSet.description}</Text>}
                            {isLoading && <Text>{t("Loading flash cards...")}</Text>}
                            {error && <Text color="bushido.error">{t(error)}</Text>}
                            {!isLoading && !error && flashCards.length === 0 && (
                                <Text>{t("This set has no flash cards.")}</Text>
                            )}
                            {!isLoading && !error && (
                                <HStack gap={{ base: 4, sm: 6 }} flexWrap="wrap" pt={2} borderTopWidth="1px" borderColor="bushido.outlineVariant">
                                    {[
                                        [t("Total"), flashCards.length, "bushido.ink"],
                                        [t("Remembered"), flashCards.filter((card) => card.status === "remembered").length, "bushido.primary"],
                                        [t("Forgotten"), flashCards.filter((card) => card.status === "forgotten").length, "bushido.tertiary"],
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
                            {t("Practice!")}
                        </Button>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems={{ base: "stretch", lg: "center" }} flexDirection={{ base: "column", lg: "row" }}>
                                <Button {...secondaryButtonStyles} width={{ base: "100%", sm: "auto" }} alignSelf={{ base: "stretch", sm: "flex-start" }} onClick={handleBackToSets}>
                                    {t("Back to flashcard sets")}
                                </Button>
                            <HStack justify="center" gap={{ base: 2, sm: 4 }} flexWrap="wrap">
                                <Button
                                    {...(currentCardMode === "remembered" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("remembered")}
                                >
                                    {t("Remembered")}
                                </Button>
                                <Button
                                    {...(currentCardMode === "all" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("all")}
                                >
                                    {t("All")}
                                </Button>
                                <Button
                                    {...(currentCardMode === "forgotten" ? primaryButtonStyles : secondaryButtonStyles)}
                                    onClick={() => setCurrentCardMode("forgotten")}
                                >
                                    {t("Forgotten")}
                                </Button>
                            </HStack>
                                <Button {...primaryButtonStyles} width={{ base: "100%", sm: "auto" }} alignSelf={{ base: "stretch", sm: "flex-end" }} onClick={handleNewFlashCard}>
                                    {t("New Flashcard")}
                                </Button>
                    </HStack>
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
                        {t("My Flashcard sets")}
                    </Text>
                    <Button {...primaryButtonStyles} width={{ base: "100%", sm: "auto" }} onClick={handleNewFlashCardSet}>{t("New Flashcard Set")}</Button>
                </HStack>
                {error && <Text color="bushido.error">{t(error)}</Text>}
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

            <Dialog.Root
                open={isNewSetFormOpen}
                onOpenChange={({ open }) => !open && closeNewSetForm()}
                closeOnEscape={!isSubmitting}
                closeOnInteractOutside={!isSubmitting}
                lazyMount
                unmountOnExit
            >
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(8px)" />
                    <Dialog.Positioner>
                        <Dialog.Content as="form" onSubmit={handleSubmitNewFlashCardSet} maxW="520px" bg="bushido.surfaceLowest" borderWidth="1px" borderColor="bushido.outline" borderRadius="4px">
                            <Dialog.Header><Dialog.Title>{t("New Flashcard Set")}</Dialog.Title></Dialog.Header>
                            <Dialog.Body>
                                <VStack align="stretch" gap={3}>
                                    <Input
                                        aria-label={t("Name")}
                                        name="name"
                                        placeholder={t("Name")}
                                        value={newSet.name}
                                        onChange={(event) => setNewSet((set) => ({ ...set, name: event.target.value }))}
                                        backgroundColor="white"
                                        color="gray.900"
                                        autoFocus
                                        required
                                    />
                                    <Textarea
                                        aria-label={t("Description")}
                                        name="description"
                                        placeholder={t("Description")}
                                        value={newSet.description}
                                        onChange={(event) => setNewSet((set) => ({ ...set, description: event.target.value }))}
                                        backgroundColor="white"
                                        color="gray.900"
                                    />
                                    {formError && <Text color="bushido.error">{t(formError)}</Text>}
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button {...secondaryButtonStyles} type="button" disabled={isSubmitting} onClick={closeNewSetForm}>{t("Cancel")}</Button>
                                <Button {...primaryButtonStyles} type="submit" loading={isSubmitting} loadingText={t("Creating")}>{t("Submit")}</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {selectedSet && (
                <Dialog.Root
                    open={isEditingSet}
                    onOpenChange={({ open }) => !open && closeEditSetForm()}
                    closeOnEscape={!isSubmitting}
                    closeOnInteractOutside={!isSubmitting}
                    lazyMount
                    unmountOnExit
                >
                    <Portal>
                        <Dialog.Backdrop backdropFilter="blur(8px)" />
                        <Dialog.Positioner>
                            <Dialog.Content as="form" onSubmit={(event) => handleEditFlashCardSet(event, selectedSet)} maxW="520px" bg="bushido.surfaceLowest" borderWidth="1px" borderColor="bushido.outline" borderRadius="4px">
                                <Dialog.Header><Dialog.Title>{t("Edit Flashcard Set")}</Dialog.Title></Dialog.Header>
                                <Dialog.Body>
                                    <VStack align="stretch" gap={3}>
                                        <Input aria-label={t("Set name")} name="name" placeholder={t("Set name")} defaultValue={selectedSet.name} backgroundColor="white" autoFocus required />
                                        <Input aria-label={t("Set description")} name="description" placeholder={t("Set description")} defaultValue={selectedSet.description} backgroundColor="white" />
                                        {formError && <Text color="bushido.error">{t(formError)}</Text>}
                                    </VStack>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button {...secondaryButtonStyles} type="button" disabled={isSubmitting} onClick={closeEditSetForm}>{t("Cancel")}</Button>
                                    <Button {...primaryButtonStyles} type="submit" loading={isSubmitting} loadingText={t("Saving")}>{t("Save Changes")}</Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}

            {selectedSet && (
                <Dialog.Root
                    open={isNewCardFormOpen}
                    onOpenChange={({ open }) => !open && closeNewCardForm()}
                    closeOnEscape={!isSubmitting}
                    closeOnInteractOutside={!isSubmitting}
                    lazyMount
                    unmountOnExit
                >
                    <Portal>
                        <Dialog.Backdrop backdropFilter="blur(8px)" />
                        <Dialog.Positioner>
                            <Dialog.Content as="form" onSubmit={handleSubmitNewFlashCard} maxW="520px" bg="bushido.surfaceLowest" borderWidth="1px" borderColor="bushido.outline" borderRadius="4px">
                                <Dialog.Header><Dialog.Title>{t("New Flashcard")}</Dialog.Title></Dialog.Header>
                                <Dialog.Body>
                                    <VStack align="stretch" gap={3}>
                                        <Box position="relative">
                                            <Input
                                                aria-label={t("Type your kanji/vocab/grammar term here...")}
                                                name="content"
                                                placeholder={t("Type your kanji/vocab/grammar term here...")}
                                                value={newCardQuery}
                                                onChange={handleNewFlashCardChange}
                                                backgroundColor="white"
                                                color="gray.900"
                                                autoFocus
                                                required
                                            />
                                            <SuggestionList
                                                open={isSuggestionsOpen}
                                                suggestions={suggestions}
                                                maxHeight="200px"
                                                onSelect={(suggestion, text) => {
                                                    setSelectedSuggestion(suggestion);
                                                    setNewCardQuery(text);
                                                    setIsSuggestionsOpen(false);
                                                }}
                                            />
                                        </Box>
                                        {selectedSuggestion && <Text color="bushido.ink">{t("Selected")} {t(selectedSuggestion.type)}: {selectedSuggestion.text}</Text>}
                                        {formError && <Text color="bushido.error">{t(formError)}</Text>}
                                    </VStack>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Button {...secondaryButtonStyles} type="button" disabled={isSubmitting} onClick={closeNewCardForm}>{t("Cancel")}</Button>
                                    <Button {...primaryButtonStyles} type="submit" loading={isSubmitting} loadingText={t("Creating")} disabled={!selectedSuggestion}>{t("Create Flashcard")}</Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}
        </FullScreenVSection>
    );
}
