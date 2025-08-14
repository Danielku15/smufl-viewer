import { isSearchMatch, type SearchEventDetails } from "./search";
import type { SmuflMetadataRange } from "./smufl";
import type { SmuflGlyphElement } from "./smufl-glyph";
import { createTemplate } from "./utils";


const headingTemplate = createTemplate<HTMLHeadingElement>(`
    <h3 class="border-bottom pb-2 mb-2"><span class="range-title"></span> <span class="text-secondary range-info">({range.name}, {range.start} - {range.end})</span></h3>
`)

const gridTemplate = createTemplate<HTMLDivElement>(`
    <div class="grid">
    </div>
`);

export class SmuflRangeElement extends HTMLElement {
    #range: SmuflMetadataRange;
    #glyphs: SmuflGlyphElement[] = [];

    constructor(range: SmuflMetadataRange) {
        super();
        this.#range = range;
        this.classList.add('d-block', 'my-3', 'p-3', 'bg-body', 'rounded', 'shadow-sm')
    }

    connectedCallback() {
        const heading = headingTemplate();

        heading.querySelector<HTMLSpanElement>('.range-title')!.innerText = this.#range.description;
        heading.querySelector<HTMLSpanElement>('.range-info')!.innerText = `(${this.#range.name}, ${this.#range.start} - ${this.#range.end})`;

        this.appendChild(heading);

        const grid = gridTemplate();

        for (const g of this.#glyphs) {
            grid.appendChild(g);
        }

        this.appendChild(grid);
    }

    addGlyph(glyph: SmuflGlyphElement) {
        this.#glyphs.push(glyph);
        if (this.isConnected) {
            this.querySelector('.grid')!.appendChild(glyph);
        }
    }

    get isVisible(): boolean {
        return !this.classList.contains('d-none');
    }
    set isVisible(v: boolean) {
        if (v) {
            this.classList.remove('d-none');
        } else {
            this.classList.add('d-none');
        }
    }

    search(search: SearchEventDetails) {
        // clear search
        if (!search.searchText) {
            for (const g of this.#glyphs) {
                g.isVisible = true;
            }
            this.isVisible = true;
            return;
        }

        switch (search.searchType) {
            case "":
            case "glyph":
            case "codepoint":
            case "class":
                this.#searchGlyphs(search);
                break;
            case "range":
                if (isSearchMatch(search, this.#range.name) ||
                    isSearchMatch(search, this.#range.description)) {
                    for (const g of this.#glyphs) {
                        g.isVisible = true;
                    }
                    this.isVisible = true;
                } else {
                    this.isVisible = false;
                }
                break;
        }
    }

    #searchGlyphs(search: SearchEventDetails) {
        let matches = 0;
        for (const g of this.#glyphs) {
            if (g.isSearchMatch(search)) {
                g.isVisible = true;
                matches++;
            } else {
                g.isVisible = false;
            }
        }

        this.isVisible = matches > 0;
    }
}
customElements.define("smufl-range", SmuflRangeElement);
