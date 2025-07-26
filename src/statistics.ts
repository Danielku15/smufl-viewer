import type { SmuflState } from "./utils";

function updateStatistics(state: SmuflState) {
    const smuflGlyphCompleteness = document.querySelector<HTMLDivElement>('#smufl-glyph-completeness');

    let totalGlyphs = 0;
    let availableGlyphs = 0;

    for (const range of state.metadata.ranges) {
        for (const glyph of range.glyphs) {
            totalGlyphs++;
            if (state.isGlyphAvailable(glyph)) {
                availableGlyphs++;
            }
        }
    }

    const percent = (availableGlyphs / totalGlyphs) * 100;
    smuflGlyphCompleteness!.style.width = `${percent}%`;
    smuflGlyphCompleteness!.innerText = `${availableGlyphs}/${totalGlyphs} (${percent.toFixed(1)}%)`
}

export function initStatistics(state: SmuflState) {
    state.addEventListener('changed', () => {
        updateStatistics(state);
    });
    updateStatistics(state);
}