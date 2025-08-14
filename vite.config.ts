import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

function trimSlash(v: string | undefined) {
    if (!v) {
        return v;
    }
    if (v.endsWith('/')) {
        return v.substring(0, v.length - 1);
    }
    return v;
}

export default defineConfig(() => {
    return {
        base: trimSlash(process.env.BASE_URL),
        plugins: [
            tsconfigPaths()
        ]
    };
});
