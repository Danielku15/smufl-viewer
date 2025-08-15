import { type SmuflMetadata, type SmuflFontDefinition, type SmuflFontMetadata, type SmuflMetadataGlyph, smuflEmptyGlyphs } from "./smufl";

export interface TypedEventTarget<EventMap> extends EventTarget {
    addEventListener<K extends keyof EventMap>(
        type: K,
        callback: ((event: EventMap[K]) => void) | null,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void;


    removeEventListener<K extends keyof EventMap>(
        type: K,
        callback: ((event: EventMap[K]) => void) | null,
        options?: boolean | AddEventListenerOptions
    ): void;
    removeEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void;


    dispatchEvent(event: Event): boolean;
}

export function createTemplate<T>(str: string): () => T {
    const template = document.createElement('template');
    template.innerHTML = str;
    return () => (template.content.cloneNode(true) as DocumentFragment).firstElementChild as T;

}

const errorElementTemplate = createTemplate<HTMLDivElement>(`
        <div class="alert alert-danger" role="alert"></div>
    `);

export function showError(e: unknown) {
    console.log('Unexpected error', e);
    const main = document.querySelector('main')!;

    const errorElement = errorElementTemplate();

    if (typeof e === 'string') {
        errorElement.innerText = e;
    } else if (e instanceof Error) {
        const pre = document.createElement('pre');
        pre.innerText = String(e.stack);
        errorElement.appendChild(pre);
    } else {
        errorElement.innerText = String(e);
    }

    main.prepend(errorElement);
}

export class SmuflState extends EventTarget implements TypedEventTarget<{
    changed: CustomEvent
}> {
    metadata: SmuflMetadata;
    font: SmuflFontDefinition;
    fontMetadata: SmuflFontMetadata;
    fontSize: number;
    scale: number;
    measureContext: CanvasRenderingContext2D

    constructor(metadata: SmuflMetadata, font: SmuflFontDefinition, fontMetadata: SmuflFontMetadata) {
        super();
        this.measureContext = document.createElement('canvas').getContext('2d')!;
        this.metadata = metadata;
        this.font = font;
        this.fontSize = 36;
        this.fontMetadata = fontMetadata;
        this.scale = 2;
    }

    switchFont(font: SmuflFontDefinition, fontMetadata: SmuflFontMetadata) {
        this.font = font;
        this.fontMetadata = fontMetadata;
        this.#isGlyphAvailable.clear();
        this.dispatchEvent(new CustomEvent('changed'))
    }

    staffSpaceToPixel(sp: number): number {
        const pixelPerStaffSpace = this.fontSize / 4;
        return sp * pixelPerStaffSpace * this.scale;
    }

    #isGlyphAvailable: Map<SmuflMetadataGlyph, boolean> = new Map();

    isGlyphAvailable(glyph: SmuflMetadataGlyph) {
        let isAvailable = this.#isGlyphAvailable.get(glyph);
        if (isAvailable !== undefined) {
            return isAvailable;
        }

        isAvailable = smuflEmptyGlyphs.has(glyph.name) || glyph.name in this.fontMetadata.glyphBBoxes;

        this.#isGlyphAvailable.set(glyph, isAvailable);

        return isAvailable;
    }
}

export async function loadingIndicator(action: () => Promise<void>) {
    const main = document.querySelector('main')!;
    try {
        main.classList.add('loading')
        await action();
    } catch (e) {
        showError(e);
    } finally {
        main.classList.remove('loading')
    }
}

export interface IVirtualizable {
    show(): void;
    hide(): void;
}

export type Virtualizable = Element & IVirtualizable

let visibilityObserver: IntersectionObserver | undefined;
function checkVisibility(entries: IntersectionObserverEntry[]) {
    for (const e of entries) {
        if (e.isIntersecting) {
            (e.target as unknown as IVirtualizable).show();
        } else {
            (e.target as unknown as IVirtualizable).hide();
        }
    }
}

export function virtualize(virtualize: Virtualizable) {
    let observer = visibilityObserver;
    if (!observer) {
        observer = new IntersectionObserver(checkVisibility, {
        })
    }
    observer.observe(virtualize)
}

export function unvirtualize(virtualize: Virtualizable) {
    visibilityObserver?.unobserve(virtualize)
}