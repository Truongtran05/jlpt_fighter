import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    "html, body, #root": { minHeight: "100%" },
    body: { margin: 0, background: "#f1fcf7", color: "#171d1a", fontFamily: "'Space Grotesk', system-ui, sans-serif" },
    "*": { borderColor: "#bec9c2" },
    "::selection": { background: "#a8f1ca", color: "#002112" },
  },
  theme: { tokens: {
    colors: { bushido: {
      surface: { value: "#f1fcf7" }, surfaceLow: { value: "#ebf6f1" }, surfaceHigh: { value: "#e0ece6" },
      ink: { value: "#171d1a" }, muted: { value: "#3f4944" }, outline: { value: "#bec9c2" },
      primary: { value: "#1e5f41" }, primaryHover: { value: "#174b34" }, primarySoft: { value: "#a8f1ca" },
      secondarySoft: { value: "#cfe9d7" }, error: { value: "#ba1a1a" },
    } },
    fonts: { body: { value: "'Space Grotesk', system-ui, sans-serif" }, heading: { value: "'Space Grotesk', system-ui, sans-serif" } },
    radii: { bushido: { value: "8px" } },
  } },
})

export const system = createSystem(defaultConfig, config)
