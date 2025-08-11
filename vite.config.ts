import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => {
    return {
        base: process.env.BASE_URL,
        plugins: [
            tsconfigPaths()
        ]
    };
});
