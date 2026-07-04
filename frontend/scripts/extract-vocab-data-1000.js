import { readFile, writeFile } from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"

const inputPath = fileURLToPath(
    new URL("../src/stores/DataVocab.json", import.meta.url),
)

const outputPath = fileURLToPath(
    new URL("../src/stores/PsuedoDataVocab.json", import.meta.url),
)

async function extractVocabData() {
    const source = JSON.parse(await readFile(inputPath, "utf8"));
    if(!Array.isArray(source)) {
        throw new TypeError('Expected the source JSON to be an array of vocab objects');
    }
    const extractedData = [];
    for(let i = 0; i < 1000; i++) {
        extractedData.push(source[i]);
    }
    await writeFile(outputPath, `${JSON.stringify(extractedData, null, 2)}\n`, "utf8");
    console.log(`Extracted ${extractedData.length} vocab entries to ${outputPath}`);
}

extractVocabData().catch((error) => {
    console.error('Error occurred while extracting vocab data:', error);
    process.exitCode = 1;
});