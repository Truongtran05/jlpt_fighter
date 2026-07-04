import { readFile, writeFile } from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"

const inputPath = fileURLToPath(
    new URL("../src/stores/DataKanji.json", import.meta.url),
)

const outputPath = fileURLToPath(
    new URL("../src/stores/PsuedoDataKanji.json", import.meta.url),
)

async function extractKanjiData() {
    const source = JSON.parse(await readFile(inputPath, "utf8"));
    if(!Array.isArray(source)) {
        throw new TypeError('Expected the source JSON to be an array of kanji objects');
    }
    const extractedData = [];
    // for(let i = 0; i < 1000; i++) {
    //     extractedData.push(source[i]);
    // }
    extractedData.push(...source.slice(0, 1000));
    await writeFile(outputPath, `${JSON.stringify(extractedData, null, 2)}\n`, "utf8");
    console.log(`Extracted ${extractedData.length} kanji entries to ${outputPath}`);
}

extractKanjiData().catch((error) => {
    console.error('Error occurred while extracting kanji data:', error);
    process.exitCode = 1;
});