import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    "html, body, #root": { minHeight: "100%" },
    body: { margin: 0, background: "#f1fcf7", color: "#141e1b", fontFamily: "'Noto Sans', sans-serif", fontSize: "16px", lineHeight: "28px" },
    "h1, h2, h3, h4, h5, h6": { fontFamily: "'Space Grotesk', sans-serif" },
    "input, textarea": { borderColor: "#707972", borderRadius: "4px", _focusVisible: { borderColor: "#00472c", outline: "2px solid #93d5af", outlineOffset: "1px" } },
    "*": { borderColor: "#bfc9c0" },
    "::selection": { background: "#aff1ca", color: "#002112" },
  },
  theme: { tokens: {
    colors: {
      bushido: {
        surface: { value: "#f1fcf7" },
        surfaceLowest: { value: "#ffffff" },
        surfaceLow: { value: "#ebf6f1" },
        surfaceContainer: { value: "#e5f0eb" },
        surfaceHigh: { value: "#dfebe6" },
        surfaceHighest: { value: "#dae5e0" },
        ink: { value: "#141e1b" },
        muted: { value: "#404942" },
        outline: { value: "#707972" },
        outlineVariant: { value: "#bfc9c0" },
        primary: { value: "#00472c" },
        primaryHover: { value: "#1e5f41" },
        primarySoft: { value: "#aff1ca" },
        secondary: { value: "#4d6356" },
        secondarySoft: { value: "#cde6d5" },
        tertiary: { value: "#6b2800" },
        tertiaryHover: { value: "#913800" },
        tertiarySoft: { value: "#ffdbcc" },
        error: { value: "#ba1a1a" },
        errorSoft: { value: "#ffdad6" },
      }
    },
    fonts: {
      body: { value: "'Noto Sans', sans-serif" },
      heading: { value: "'Space Grotesk', sans-serif" },
      mono: { value: "'JetBrains Mono', monospace" },
    },
    radii: { bushido: { value: "4px" }, bushidoButton: { value: "8px" } },
  } },
})

export const system = createSystem(defaultConfig, config)
