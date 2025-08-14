import { isSearchMatch, type SearchEventDetails } from "./search";
import { parseCodePoint, type SmuflMetadataGlyph } from "./smufl";
import { SmuflGlyphCanvasElement } from "./smufl-glyph-canvas";
import { createTemplate, type SmuflState } from "./utils";

const canvasTemplate = createTemplate<HTMLDivElement>(`
    <div class="g-col-4 text-center">
    </div>
`)
const detailsTemplate = createTemplate<HTMLDivElement>(`
        <div class="g-col-8">
            <h6 class="text-truncate"><span class="glyph-title"></span> <span class="text-secondary glyph-codepoint"></span></h6>
            <span class="text-secondary glyph-description"></span>
            <div class="glyph-details"></div>
        </div>
`);
const glyphDetailsTableTemplate = createTemplate<HTMLTableElement>(`
        <table class="table table-striped">
            <tbody>

            </tbody>
        </table>
`);

export class SmuflGlyphElement extends HTMLElement {
    #glyph: SmuflMetadataGlyph;
    #state: SmuflState;

    get glyph() {
        return this.#glyph;
    }

    constructor(glyph: SmuflMetadataGlyph, state: SmuflState) {
        super();
        this.#glyph = glyph;
        this.#state = state;
    }

    public isSearchMatch(search: SearchEventDetails): boolean {
        switch (search.searchType) {
            case "":
                return this.#isSearchMatchGlyph(search) ||
                    this.#isSearchMatchCodepoint(search) ||
                    this.#isSearchMatchClass(search);
            case "glyph":
                return this.#isSearchMatchGlyph(search);
            case "codepoint":
                return this.#isSearchMatchCodepoint(search);
            case "class":
                return this.#isSearchMatchClass(search);
            case "range":
                return false;
        }
    }

    #isSearchMatchGlyph(search: SearchEventDetails): boolean {
        return isSearchMatch(search, this.#glyph.name) ||
            isSearchMatch(search, this.#glyph.description);

    }
    #isSearchMatchCodepoint(search: SearchEventDetails): boolean {
        switch (search.searchOperator) {
            case "contains":
                const glyphCodepointText = `u+${this.#glyph.codepoint.toString(16).toLowerCase()}`;
                return isSearchMatch(search, glyphCodepointText);
            case "equals":
                const inputCodePoint = parseCodePoint(search.searchText);
                if (Number.isNaN(inputCodePoint)) {
                    return false;
                }
                return inputCodePoint === this.#glyph.codepoint;
        }

    }

    #isSearchMatchClass(search: SearchEventDetails): boolean {
        return this.#glyph.classes.some(c => isSearchMatch(search, c));
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


    get scale(): number {
        return parseFloat(this.getAttribute('scale') ?? "1");
    }

    set scale(val: number) {
        this.setAttribute('scale', String(val));
    }

    get showAnchorText(): boolean {
        return this.hasAttribute('show-anchor-text');
    }

    set showAnchorText(val: boolean) {
        if (val) {
            this.setAttribute('show-anchor-text', String(val));
        } else {
            this.removeAttribute('show-anchor-text');
        }
    }

    get showDetails(): boolean {
        return this.hasAttribute('show-details');
    }

    set showDetails(val: boolean) {
        if (val) {
            this.setAttribute('show-details', String(val));
        } else {
            this.removeAttribute('show-details');
        }
    }

    connectedCallback() {
        this.classList.add('g-col-6', 'grid', 'p-1')
        const state = this.#state;

        const canvas = canvasTemplate();
        const canvasElement = new SmuflGlyphCanvasElement(this.#glyph, this.#state);
        canvasElement.scale = this.scale;
        canvasElement.showAnchorText = this.showAnchorText;
        canvas.append(canvasElement);
        this.appendChild(canvas);

        const details = detailsTemplate(); details.querySelector<HTMLSpanElement>('.glyph-title')!.innerText = this.#glyph.name;
        details.querySelector<HTMLSpanElement>('.glyph-codepoint')!.innerText = `(U+${this.#glyph.codepoint.toString(16).toUpperCase()})`;
        details.querySelector<HTMLSpanElement>('.glyph-description')!.innerText = this.#glyph.description;

        const glyphDetails = details.querySelector<HTMLSpanElement>('.glyph-details')!;
        if (this.showDetails) {
            const records: [string, string][] = [
                ['Codepoint', `U+${this.#glyph.codepoint.toString(16).toUpperCase()}`],
                ['HTML Entity (dec)', `0x#${this.#glyph.codepoint.toString()}`],
                ['Classes', this.#glyph.classes.join(', ')]
            ];


            const bBoxes = state.fontMetadata.glyphBBoxes[this.#glyph.name];

            function staffSpaceToPixel(sp: number): string {
                return state.staffSpaceToPixel(sp).toFixed(2);
            }

            if (bBoxes) {
                const glyphWidth = (bBoxes.bBoxNE[0] - bBoxes.bBoxSW[0]);
                const glyphHeight = (bBoxes.bBoxNE[1] - bBoxes.bBoxSW[1]);
                records.push(
                    ['Size (sp)', `${glyphWidth} x ${glyphHeight}`],
                    ['Size (px)', `${staffSpaceToPixel(glyphWidth)} / ${staffSpaceToPixel(glyphHeight)}`],

                    ['bBoxNE (sp)', `${bBoxes.bBoxNE[0]} / ${bBoxes.bBoxNE[1]}`],
                    ['bBoxNE (px)', `${staffSpaceToPixel(bBoxes.bBoxNE[0])} / ${staffSpaceToPixel(bBoxes.bBoxNE[1])}`],
                    ['bBoxSW (sp)', `${bBoxes.bBoxSW[0]} / ${bBoxes.bBoxSW[1]}`],
                    ['bBoxSW (px)', `${staffSpaceToPixel(bBoxes.bBoxSW[0])} / ${staffSpaceToPixel(bBoxes.bBoxSW[1])}`],
                );
            }

            const anchors = state.fontMetadata.glyphsWithAnchors[this.#glyph.name];
            if (anchors) {
                for (const name in anchors) {
                    const anchorValue = anchors[name as keyof typeof anchors]!;
                    records.push(
                        [`${name} (sp)`, `${anchorValue[0]}/${anchorValue[0]}`],
                        [`${name} (px)`, `${staffSpaceToPixel(anchorValue[0])}/${staffSpaceToPixel(anchorValue[0])}`]
                    )
                }
            }


            // TOOD Alternatives

            const table = glyphDetailsTableTemplate();
            glyphDetails.appendChild(table)
            const body = table.tBodies[0];

            for (const record of records) {
                const row = document.createElement('tr');
                body.appendChild(row);

                const keyData = document.createElement('td');
                keyData.innerText = record[0];
                row.appendChild(keyData);

                const valueData = document.createElement('td');
                valueData.innerText = record[1];
                row.appendChild(valueData);
            }
        }


        this.appendChild(details);
    }

}
customElements.define("smufl-glyph", SmuflGlyphElement);
