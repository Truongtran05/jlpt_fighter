import FlashCard from "./FlashCard.jsx";
import {Box, Button, Dialog, HStack, Portal, VStack, Text} from "@chakra-ui/react";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";
import { FaX } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import {updateFlashCardStatus} from "../api/services/LearningServices.js"
import { useLanguage } from "../contexts/LanguageContext.jsx";

const slideMs = 320;
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

const ghostButtonStyles = {
    bg: "transparent",
    color: "bushido.ink",
    borderRadius: "8px",
    borderWidth: "0px",
    _hover: { bg: "bushido.surfaceLow", borderColor: "bushido.primary" , borderWidth: "1px"},
};

export default function FlashCardCarousel({ flashCards = [], onStatusUpdated, onEndSession }) {
    const { language, t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState(null);
    const [isEntering, setIsEntering] = useState(false);
    const slideTimeout = useRef(null);
    const enterFrame = useRef(null);
    const currentFlashCard = flashCards[Math.min(currentIndex, flashCards.length - 1)];
    const [progressCount, setProgressCount] = useState(1);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => () => {
        clearTimeout(slideTimeout.current);
        cancelAnimationFrame(enterFrame.current);
    }, []);

    if (!currentFlashCard) {
        return <Text color="bushido.muted">{t("This set has no flash cards.")}</Text>;
    }

    function move(direction) {
        direction === "next" ? setProgressCount((prev) => Math.min(prev + 1, flashCards.length)) : setProgressCount((prev) => Math.max(prev - 1, 0));
        // console.log("Progress Count:", progressCount, "Current Index:", currentIndex, "Flash Cards Length:", flashCards.length);
        if (
            slideDirection ||
            (direction === "prev" && currentIndex === 0) ||
            (direction === "next" && currentIndex === flashCards.length - 1)
        ) {
            return;
        }

        setSlideDirection(direction);
        slideTimeout.current = setTimeout(() => {
            setCurrentIndex((prev) => prev + (direction === "next" ? 1 : -1));
            setSlideDirection(null);
            setIsEntering(true);
            enterFrame.current = requestAnimationFrame(() => setIsEntering(false));
        }, slideMs);
    }

    const handleCardStatusChange = async (flashCardId, status) => {
        try {
            const response = await updateFlashCardStatus(flashCardId, {"status": status}, language);
            onStatusUpdated?.(response.data);
            if (currentIndex === flashCards.length - 1) {
                setProgressCount(flashCards.length);
                setIsComplete(true);
            } else {
                move("next");
            }
        } catch (error) {
            console.error("Error updating flash card status:", error);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
        setProgressCount(1);
        setIsComplete(false);
    };

    return (
        <VStack spacing={4} width="100%" align="center">
            <Box width="100%" maxW="420px" h="6px" mt={1} overflow="hidden" bg="bushido.surfaceContainerHigh" borderRadius="full" role="progressbar" aria-label={t("Remembered flashcards")} aria-valuemin={0} aria-valuemax={Math.max(flashCards.length, 1)} aria-valuenow={progressCount}>
                <Box h="100%" w={`${(progressCount / Math.max(flashCards.length, 1)) * 100}%`} bg="bushido.primary" transition="width .2s ease" />
            </Box>
            <HStack gap={0} py={4} width="100%" justify="center" position="relative">
                <Button
                    {...ghostButtonStyles}
                    onClick={() => move("prev")}
                    disabled={currentIndex === 0 || slideDirection !== null}
                    minHeight="260px"
                    position={{ base: "absolute", md: "static" }}
                    left={{ base: 0, md: "auto" }}
                    zIndex={1}
                >
                    <GrPrevious />
                </Button>
                <Box
                    transformOrigin={slideDirection === "prev" ? "bottom right" : "bottom left"}
                    transform={
                        slideDirection === "next"
                            ? "translateX(-130%) rotate(-22deg)"
                            : slideDirection === "prev"
                            ? "translateX(130%) rotate(22deg)"
                            : "translateX(0) rotate(0deg)"
                    }
                    opacity={slideDirection || isEntering ? 0 : 1}
                    transition={slideDirection
                        ? `transform ${slideMs}ms ease, opacity ${slideMs}ms ease`
                        : `opacity ${slideMs}ms ease`
                    }
                    width="100%"
                    maxW="420px"
                >
                    <FlashCard flashCard={currentFlashCard} isEditable={false} />
                </Box>
                <Button
                    {...ghostButtonStyles}
                    onClick={() => move("next")}
                    disabled={currentIndex === flashCards.length - 1 || slideDirection !== null}
                    minHeight="260px"
                    position={{ base: "absolute", md: "static" }}
                    right={{ base: 0, md: "auto" }}
                    zIndex={1}
                >
                    <GrNext />
                </Button>
            </HStack>
            <HStack align="center" spacing={8}>
                <Button
                    {...primaryButtonStyles}
                    onClick={() => handleCardStatusChange(currentFlashCard.flash_card_id, "remembered")}
                >
                    <FaCheck />
                </Button>
                <Button
                    {...secondaryButtonStyles}
                    onClick={() => handleCardStatusChange(currentFlashCard.flash_card_id, "forgotten")}
                >
                    <FaX />
                </Button>
            </HStack>
            <Dialog.Root open={isComplete} closeOnEscape={false} closeOnInteractOutside={false}>
                <Portal>
                    <Dialog.Backdrop backdropFilter="blur(8px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="bushido.surfaceLowest" borderWidth="1px" borderColor="bushido.outline" borderRadius="4px">
                            <Dialog.Header>
                                <Dialog.Title>{t("Session complete")}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text color="bushido.muted">{t("You have reviewed every flashcard in this session.")}</Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button {...secondaryButtonStyles} onClick={onEndSession}>{t("End session")}</Button>
                                <Button {...primaryButtonStyles} onClick={restart}>{t("Restart")}</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </VStack>
    )
}
