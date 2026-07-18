import FlashCard from "./FlashCard.jsx";
import {Box, Button, HStack, VStack, Text} from "@chakra-ui/react";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";
import { FaX } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import AuthApiClient from "../api/AuthApiClient.js";

const slideMs = 320;
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

export default function FlashCardCarousel({ flashCards = [], onStatusUpdated }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState(null);
    const [isEntering, setIsEntering] = useState(false);
    const slideTimeout = useRef(null);
    const enterFrame = useRef(null);
    const currentFlashCard = flashCards[Math.min(currentIndex, flashCards.length - 1)];

    useEffect(() => () => {
        clearTimeout(slideTimeout.current);
        cancelAnimationFrame(enterFrame.current);
    }, []);

    if (!currentFlashCard) {
        return <Text color="white">This set has no flash cards.</Text>;
    }

    function move(direction) {
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
            const response = await AuthApiClient.patch(`/flashcards/${flashCardId}/status/`,{
                'status' : status
            });
            onStatusUpdated?.(response.data);
        } catch (error) {
            console.error("Error updating flash card status:", error);
        } finally{
            move("next");
        }
    };

    return (
        <VStack spacing={4} width="100%" align="center">
            <HStack spacing={4} py={4} width="100%" justify="center">
                <Button
                    {...secondaryButtonStyles}
                    onClick={() => move("prev")}
                    disabled={currentIndex === 0 || slideDirection !== null}
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
                    <FlashCard flashCard={currentFlashCard} />
                </Box>
                <Button
                    {...secondaryButtonStyles}
                    onClick={() => move("next")}
                    disabled={currentIndex === flashCards.length - 1 || slideDirection !== null}
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
        </VStack>
    )
}
