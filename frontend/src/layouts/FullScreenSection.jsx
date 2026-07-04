import {VStack} from "@chakra-ui/react";

function FullScreenSection({children,isDarkBackground, ...props}) {
  return (
    <VStack 
        color={isDarkBackground ? "white" : "black"}
        backgroundColor={props.backgroundColor}
    >
      <VStack maxWidth="1280px" width="100%" minHeight="100vh" {...props}>
        {children}
      </VStack>
    </VStack>
  )
}

export default FullScreenSection