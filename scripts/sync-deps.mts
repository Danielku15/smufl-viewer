import fs from 'node:fs';
import path from 'node:path';

const paths = [
    // SmuFL spec
    [
        "submodules/smufl/metadata/classes.json",
        "public/smufl/classes.json"
    ],
    [
        "submodules/smufl/metadata/glyphnames.json",
        "public/smufl/glyphnames.json"
    ],
    [
        "submodules/smufl/metadata/ranges.json",
        "public/smufl/ranges.json"
    ],

    // Bravura
    [
        "submodules/bravura/redist/woff/Bravura.woff2",
        "public/smufl/fonts/bravura/font.woff2"
    ],
    [
        "submodules/bravura/redist/bravura_metadata.json",
        "public/smufl/fonts/bravura/metadata.json"
    ],
    [
        "submodules/bravura/redist/OFL.txt",
        "public/smufl/fonts/bravura/license.txt"
    ],

    // Bravura
    [
        "submodules/leland/Leland.otf",
        "public/smufl/fonts/leland/font.otf"
    ],
    [
        "submodules/leland/leland_metadata.json",
        "public/smufl/fonts/leland/metadata.json"
    ],
    [
        "submodules/leland/LICENSE.txt",
        "public/smufl/fonts/leland/license.txt"
    ],

    // Petaluma
    [
        "submodules/petaluma/redist/woff/Petaluma.woff2",
        "public/smufl/fonts/petaluma/font.woff2"
    ],
    [
        "submodules/petaluma/redist/petaluma_metadata.json",
        "public/smufl/fonts/petaluma/metadata.json"
    ],
    [
        "submodules/petaluma/redist/OFL.txt",
        "public/smufl/fonts/petaluma/license.txt"
    ],

    // Sebastian
    [
        "submodules/sebastian/fonts/Sebastian.otf",
        "public/smufl/fonts/sebastian/font.otf"
    ],
    [
        "submodules/sebastian/fonts/Sebastian.json",
        "public/smufl/fonts/sebastian/metadata.json"
    ],
    [
        "submodules/sebastian/fonts/OFL.txt",
        "public/smufl/fonts/sebastian/license.txt"
    ]
];

const root = path.resolve(import.meta.dirname, '..');

for (const asset of paths) {
    console.info('Copying %s to %s', asset[0], asset[1])

    const dest = path.resolve(root, asset[1]);
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });

    await fs.promises.copyFile(
        path.resolve(root, asset[0]),
        path.resolve(root, asset[1])
    )
}

console.info('Copy done')