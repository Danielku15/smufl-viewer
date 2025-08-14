import { Modal } from "bootstrap";
import { initFontSelector } from "./font-selector";
import { doSearch, onsearch } from "./search";
import { defaultFonts, getSmuflMetadata, loadSmuflFontMetadata, type SmuflMetadataGlyph } from "./smufl";
import { SmuflGlyphElement } from "./smufl-glyph";
import { SmuflRangeElement } from "./smufl-range";
import { initStatistics } from "./statistics";
import { SmuflState, loadingIndicator } from "./utils";

async function initializeFonts() {
    await Promise.all(Object.values(defaultFonts).map(async fontDefinition => {
        const font = new FontFace(
            fontDefinition.name,
            `url(${JSON.stringify(fontDefinition.font)})`
        )
        await font.load();
        document.fonts.add(font);
    }));
}

let appState: SmuflState = null!;
const viewer = document.querySelector('#viewer')!;

async function load() {
    await loadingIndicator(async () => {
        const metadata = await getSmuflMetadata();
        await initializeFonts();
        appState = new SmuflState(metadata, defaultFonts.bravura, await loadSmuflFontMetadata(defaultFonts.bravura));
        showGlyphs();
    })
}


function showGlyphs() {
    viewer.innerHTML = '';
    for (const range of appState.metadata.ranges) {
        const rangeElement = new SmuflRangeElement(range);

        for (const glyph of range.glyphs) {
            const glyphElement = new SmuflGlyphElement(glyph, appState);
            glyphElement.classList.add('g-col-6', 'align-items-center', 'smufl-glyph-viewer', 'rounded')
            glyphElement.onclick = () => {
                openGlyphModal(glyph);
            };
            rangeElement.addGlyph(glyphElement);
        }

        viewer.appendChild(rangeElement)
    }
}

function openGlyphModal(glyph: SmuflMetadataGlyph) {
    const el = document.querySelector<HTMLDivElement>('#glyph-modal')!;
    el.querySelector<HTMLElement>('.modal-title')!.innerText = glyph.name;
    const modal = new Modal(el);

    const detailed = new SmuflGlyphElement(glyph, appState);
    detailed.scale = 2;
    detailed.showAnchorText = true;
    detailed.showDetails = true;
    const body = el.querySelector<HTMLDivElement>('.modal-body')!;
    body.textContent = '';
    body.append(detailed);

    modal.show();
}

onsearch.addEventListener('search', (e) => {
    for (const c of viewer.children) {
        if (c instanceof SmuflRangeElement) {
            c.search(e.detail);
        }
    }
});


await load();

initFontSelector(appState)
initStatistics(appState)


const initialSearch = new URL(window.location.href).searchParams.get('search');

if (initialSearch) {
    doSearch(initialSearch);
    // search should be applied already, check if there is only glyph found
    const visibleGlyphs = Array.from(viewer.querySelectorAll<SmuflGlyphElement>('smufl-glyph')).filter(e => e.isVisible);
    if (visibleGlyphs.length === 1) {
        openGlyphModal(visibleGlyphs[0].glyph);
    }
}