import axios from "axios";

export type SmuflFontDefinition = {
    name: string;
    copyright: string;
    license: string;
    font: string;
    metadataUrl: string;
}

export const defaultFonts = {
    bravura: {
        name: "Bravura",
        copyright: "Copyright © 2015, Steinberg Media Technologies GmbH (http://www.steinberg.net/)",
        license: "SIL OPEN FONT LICENSE Version 1.1",
        font: "smufl/fonts/bravura/font.woff2",
        metadataUrl: "smufl/fonts/bravura/metadata.json"
    },
    leland: {
        name: "Leland",
        copyright: "Copyright (c) 2025, MuseScore BVBA (http://www.musescore.org/)",
        license: "SIL OPEN FONT LICENSE Version 1.1",
        font: "smufl/fonts/leland/font.otf",
        metadataUrl: "smufl/fonts/leland/metadata.json"
    },
    petaluma: {
        name: "Petaluma",
        copyright: "Copyright © 2018, Steinberg Media Technologies GmbH (http://www.steinberg.net/)",
        license: "SIL OPEN FONT LICENSE Version 1.1",
        font: "smufl/fonts/petaluma/font.woff2",
        metadataUrl: "smufl/fonts/petaluma/metadata.json"
    },
    sebastian: {
        name: "Sebastian",
        copyright: "Copyright (c) 2021, Florian Kretlow and Ben Byram-Wigfield",
        license: "SIL OPEN FONT LICENSE Version 1.1",
        font: "smufl/fonts/sebastian/font.otf",
        metadataUrl: "smufl/fonts/sebastian/metadata.json"
    }
} satisfies Record<string, SmuflFontDefinition>;


/**
 * classes.json
 */
export type SmuflClasses = {
    [name: string]: string[];
}

/**
 * glyphnames.json
 */
export type SmuflGlyphNames = {
    [name: string]: {
        codepoint: string;
        description: string;
    };
}

/**
 * ranges.json
 */
export type SmuflRanges = {
    [name: string]: {
        description: string;
        glyphs: string[];
        range_start: string;
        range_end: string;
    };
}


export type SmuflMetadataGlyph = {
    name: string;
    description: string;
    codepoint: number;
}

export type SmuflMetadataRange = {
    name: string;
    description: string;
    start: string;
    end: string;
    glyphs: SmuflMetadataGlyph[];
}

export type SmuflMetadata = {
    ranges: SmuflMetadataRange[];
}

function parseCodePoint(codepoint: string): number {
    if (codepoint.startsWith('U+')) {
        return parseInt(codepoint.substring(2), 16);
    }
    return parseInt(codepoint);
}

async function loadSmuflMetadata(): Promise<SmuflMetadata> {
    const files = await Promise.all([
        axios.get<SmuflRanges>(`/smufl/ranges.json`),
        axios.get<SmuflGlyphNames>(`/smufl/glyphnames.json`),
    ]);

    const result: SmuflMetadata = {
        ranges: []
    };

    for (const [rangeName, rangeData] of Object.entries(files[0].data)) {
        const range: SmuflMetadataRange = {
            name: rangeName,
            description: rangeData.description,
            start: rangeData.range_start,
            end: rangeData.range_end,
            glyphs: []
        }
        result.ranges.push(range);


        for (const glyphName of rangeData.glyphs) {
            const glyphData = files[1].data[glyphName];

            const glyph: SmuflMetadataGlyph = {
                name: glyphName,
                codepoint: parseCodePoint(glyphData.codepoint),
                description: glyphData.description
            };
            range.glyphs.push(glyph);
        }
    }

    return result;
}

export type SmuflFontMetadataEngravingDefaults = {
    textFontFamily: string[];
    staffLineThickness: number;
    stemThickness: number;
    beamThickness: number;
    beamSpacing: number;
    legerLineThickness: number;
    legerLineExtension: number;
    slurEndpointThickness: number;
    slurMidpointThickness: number;
    tieEndpointThickness: number;
    tieMidpointThickness: number;
    thinBarlineThickness: number;
    thickBarlineThickness: number;
    dashedBarlineThickness: number;
    dashedBarlineDashLength: number;
    dashedBarlineGapLength: number;
    barlineSeparation: number;
    thinThickBarlineSeparation: number;
    repeatBarlineDotSeparation: number;
    bracketThickness: number;
    subBracketThickness: number;
    hairpinThickness: number;
    octaveLineThickness: number;
    pedalLineThickness: number;
    repeatEndingLineThickness: number;
    arrowShaftThickness: number;
    lyricLineThickness: number;
    textEnclosureThickness: number;
    tupletBracketThickness: number;
    hBarThickness: number;
}

export type SmuflFontMetadata = {
    fontName: string;
    fontVersion: string;
    engravingDefaults: SmuflFontMetadataEngravingDefaults;
    glyphAdvanceWidths: {
        [glyphName: string]: number;
    };
    glyphBBoxes: {
        [glyphName: string]: {
            bBoxNE: [number, number];
            bBoxSW: [number, number];
        }
    };
    glyphsWithAlternates: {
        [glyphName: string]: {
            alternates: {
                codepoint: string;
                name: string
            }[]
        }
    };
    glyphsWithAnchors: {
        [glyphName: string]: {
            splitStemUpSE?: [number, number]
            splitStemUpSW?: [number, number]
            splitStemDownNE?: [number, number]
            splitStemDownNW?: [number, number]
            stemUpSE?: [number, number]
            stemDownNW?: [number, number]
            stemUpNW?: [number, number]
            stemDownSW?: [number, number]
            nominalWidth?: [number, number]
            numeralTop?: [number, number]
            numeralBottom?: [number, number]
            cutOutNE?: [number, number]
            cutOutSE?: [number, number]
            cutOutSW?: [number, number]
            cutOutNW?: [number, number]
            graceNoteSlashSW?: [number, number]
            graceNoteSlashNE?: [number, number]
            graceNoteSlashNW?: [number, number]
            graceNoteSlashSE?: [number, number]
            repeatOffset?: [number, number]
            noteheadOrigin?: [number, number]
            opticalCenter?: [number, number]
        }
    };
    ligatures: {
        [glyphName: string]: {
            codepoint: "string",
            componentGlyphs: string[];
            description: string;
        }
    };
    sets: {
        [setName: string]: {
            type: 'opticalVariantsSmall' | 'flagsShort' | 'flagsStraight' | 'timeSigsLarge' | 'noteheadsLarge';
            description: string;
            glyphs: {
                codepoints: string;
                name: string;
                alternateFor: string;
            }[]
        }
    };
    optionalGlyphs: {
        [glyphName: string]: {
            classes: string[];
            codepoint: string;
            description?: string;
        }
    }[];
}


export async function loadSmuflFontMetadata(fontDefinition: SmuflFontDefinition): Promise<SmuflFontMetadata> {
    const response = await axios.get<SmuflFontMetadata>(fontDefinition.metadataUrl);
    return response.data;
}

let smuflMetadata: SmuflMetadata | undefined;

export async function getSmuflMetadata(): Promise<SmuflMetadata> {
    // TODO: put into browser storage?
    if (!smuflMetadata) {
        smuflMetadata = await loadSmuflMetadata();
    }
    return smuflMetadata;
}

const smuflFontMetadata: Map<SmuflFontDefinition, SmuflFontMetadata> = new Map();;

export async function getSmuflFontMetadata(fontDefinition: SmuflFontDefinition): Promise<SmuflFontMetadata> {
    // TODO: put into browser storage?
    let metadata = smuflFontMetadata.get(fontDefinition);
    if (!metadata) {
        metadata = await loadSmuflFontMetadata(fontDefinition);
        smuflFontMetadata.set(fontDefinition, metadata);
    }
    return metadata;
}


/**
 * These are "empty" glyphs which have no visible display like control characters. 
 * This list is mainly derived from Bravura, assuming it is 100% complete.
 */
export const smuflEmptyGlyphs = new Set<string>([
    'controlBeginBeam',
    'controlEndBeam',
    'controlBeginTie',
    'controlEndTie',
    'controlBeginSlur',
    'controlEndSlur',
    'controlBeginPhrase',
    'controlEndPhrase',

    'clefChangeCombining',

    'staffPosRaise1',
    'staffPosRaise2',
    'staffPosRaise3',
    'staffPosRaise4',
    'staffPosRaise5',
    'staffPosRaise6',
    'staffPosRaise7',
    'staffPosRaise8',
    'staffPosLower1',
    'staffPosLower2',
    'staffPosLower3',
    'staffPosLower4',
    'staffPosLower5',
    'staffPosLower6',
    'staffPosLower7',
    'staffPosLower8',

    'dynamicCombinedSeparatorSpace',

    'noteheadNull',

    'accSagittalUnused1',
    'accSagittalUnused2',
    'accSagittalUnused3',
    'accSagittalUnused4',

    'timeSigCombNumerator',
    'timeSigCombDenominator',
])