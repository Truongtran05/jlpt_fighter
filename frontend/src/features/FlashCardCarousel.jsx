import FlashCard from "./FlashCard.jsx";
import {Box, Button, HStack, Text} from "@chakra-ui/react";
import { GrNext } from "react-icons/gr";
import { GrPrevious } from "react-icons/gr";
import { useEffect, useRef, useState } from "react";

const slideMs = 320;

export default function FlashCardCarousel({ flashCards = [] }) {
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

    return (
        <HStack spacing={4} py={4} width="100%" justify="center">
            <Button
                onClick={() => move("prev")}
                disabled={currentIndex === 0 || slideDirection !== null}
            >
                <GrPrevious />
            </Button>
            <Box
                transformOrigin={slideDirection === "prev" ? "bottom left" : "bottom right"}
                transform={
                    slideDirection === "next"
                        ? "translateX(130%) rotate(22deg)"
                        : slideDirection === "prev"
                          ? "translateX(-130%) rotate(-22deg)"
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
                onClick={() => move("next")}
                disabled={currentIndex === flashCards.length - 1 || slideDirection !== null}
            >
                <GrNext />
            </Button>
        </HStack>
    )
}
