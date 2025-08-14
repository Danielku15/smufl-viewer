import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

function ensureSlash(v: string | undefined) {
    if (!v) {
        return '/';
    }
    if (v.endsWith('/')) {
        return v;
    }
    return `${v}/`;
}

export default defineConfig(() => {
    return {
        base: ensureSlash(process.env.BASE_URL),
        plugins: [
            tsconfigPaths()
        ]
    };
});
