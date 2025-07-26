import type { SmuflMetadataGlyph } from "./smufl";
import { createTemplate, type SmuflState } from "./utils";

function fillRect(x: number, y: number, w: number, h: number, fill: string) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x))
    rect.setAttribute('y', String(y))
    rect.setAttribute('width', String(w))
    rect.setAttribute('height', String(h))
    rect.setAttribute('fill', String(fill))
    return rect;
}

function strokeRect(x: number, y: number, w: number, h: number, stroke: string, strokeDasharray: string = '') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x))
    rect.setAttribute('y', String(y))
    rect.setAttribute('width', String(w))
    rect.setAttribute('height', String(h))
    rect.setAttribute('stroke', String(stroke))
    rect.setAttribute('stroke-width', "1")
    if (strokeDasharray) {
        rect.setAttribute('stroke-dasharray', strokeDasharray)
    }
    rect.setAttribute('fill', 'none')
    return rect;
}

const missingGlyphTemplate = createTemplate<HTMLSpanElement>(`
    <span class="text-danger">(glyph missing)</span>
`)

export class SmuflGlyphCanvasElement extends HTMLElement {
    #glyph: SmuflMetadataGlyph;
    #state: SmuflState;

    constructor(glyph: SmuflMetadataGlyph, state: SmuflState) {
        super();
        this.#glyph = glyph;
        this.#state = state;
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

    get scale(): number {
        return parseFloat(this.getAttribute('scale') ?? "1");
    }

    set scale(val: number) {
        this.setAttribute('scale', String(val));
    }

    update() {
        const glyph = this.#glyph;
        const state = this.#state;
        const text = String.fromCharCode(glyph.codepoint);

        if (!state.isGlyphAvailable(glyph)) {
            this.textContent = '';
            this.appendChild(missingGlyphTemplate());
            return;
        }

        const scale = state.scale * this.scale;

        const showAnchorText = this.showAnchorText;
        const padding = 5 * scale;

        let scaledBoundingBox = state.fontMetadata.glyphBBoxes[glyph.name];
        scaledBoundingBox = {
            bBoxNE: [
                state.staffSpaceToPixel(scaledBoundingBox.bBoxNE[0]) * this.scale,
                state.staffSpaceToPixel(scaledBoundingBox.bBoxNE[1]) * this.scale
            ],
            bBoxSW: [
                state.staffSpaceToPixel(scaledBoundingBox.bBoxSW[0]) * this.scale,
                state.staffSpaceToPixel(scaledBoundingBox.bBoxSW[1]) * this.scale
            ]
        }

        const glyphWidth = (scaledBoundingBox.bBoxNE[0] - scaledBoundingBox.bBoxSW[0]);
        const glyphHeight = (scaledBoundingBox.bBoxNE[1] - scaledBoundingBox.bBoxSW[1]);

        const canvasWidth = padding * 2 + glyphWidth;
        const canvasHeight = padding * 2 + glyphHeight;

        const glyphCenterX = -scaledBoundingBox.bBoxSW[0] + padding;
        const glyphCenterY = scaledBoundingBox.bBoxNE[1] + padding;

        const glyphLeft = glyphCenterX + scaledBoundingBox.bBoxSW[0];
        const glyphTop = glyphCenterY - scaledBoundingBox.bBoxNE[1];

        const anchors = state.fontMetadata.glyphsWithAnchors[glyph.name];
        type AnchorPoint = {
            name: string;
            x: number;
            y: number;
        }
        const anchorPoints: AnchorPoint[] = [];
        if (anchors) {
            for (const name in anchors) {
                const anchorValue = anchors[name as keyof typeof anchors]!;
                anchorPoints.push({
                    name,
                    x: glyphCenterX + state.staffSpaceToPixel(anchorValue[0]) * this.scale,
                    y: glyphCenterY - state.staffSpaceToPixel(anchorValue[1]) * this.scale
                })
            }
        }

        const anchorPointWidth = 4;
        const anchorTextSize = 10;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.overflow = 'visible';
        svg.setAttribute('width', String(canvasWidth))
        svg.setAttribute('height', String(canvasHeight))

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = glyph.name;
        svg.appendChild(title);

        {
            const bgg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svg.appendChild(bgg);

            bgg.appendChild(fillRect(0, 0, canvasWidth, canvasHeight, '#FFF'));
            bgg.appendChild(fillRect(glyphCenterX, 0, 1, canvasHeight, '#CCC'));
            bgg.appendChild(fillRect(0, glyphCenterY, canvasWidth, 1, '#CCC'));
        }


        const glyphText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        svg.appendChild(glyphText);
        glyphText.setAttribute('x', String(glyphCenterX));
        glyphText.setAttribute('y', String(glyphCenterY));
        glyphText.style.fontFamily = state.font.name;
        glyphText.style.fontSize = `${state.fontSize * scale}px`;
        glyphText.textContent = text;


        {
            const annotations = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svg.appendChild(annotations);

            annotations.appendChild(strokeRect(glyphLeft, glyphTop, glyphWidth, glyphHeight, 'rgb(0,0,255)', '5'));

            for (const p of anchorPoints) {
                annotations.appendChild(fillRect(p.x - anchorPointWidth / 2, p.y - anchorPointWidth / 2, anchorPointWidth, anchorPointWidth, 'rgb(200,0,0)'));

                if (showAnchorText) {
                    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txt.style.fill = 'rgb(200,0,0)';
                    txt.style.fontSize = `${anchorTextSize}px`;
                    txt.setAttribute('x', String(p.x + anchorPointWidth));
                    txt.setAttribute('y', String(p.y));
                    txt.setAttribute('dominant-baseline', 'middle');
                    txt.textContent = ` ${p.name}`;
                    annotations.appendChild(txt);
                }
            }
        }

        this.textContent = '';
        this.appendChild(svg);
    }

    connectedCallback() {
        this.#state.addEventListener('changed', () => {
            this.update();
        });

        this.update();
    }

}
customElements.define("smufl-glyph-canvas", SmuflGlyphCanvasElement);
