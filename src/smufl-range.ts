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

    search(text: string) {
        let matches = 0;
        for (const g of this.#glyphs) {
            if (!text || g.glyph.name.toLowerCase().includes(text)) {
                g.classList.remove('d-none');
                matches++;
            } else {
                g.classList.add('d-none');
            }
        }

        if (matches === 0) {
            this.classList.add('d-none');
        } else {
            this.classList.remove('d-none');
        }
    }
}
customElements.define("smufl-range", SmuflRangeElement);
