import { defaultFonts, getSmuflFontMetadata } from "./smufl";
import { createTemplate, loadingIndicator, showError, type SmuflState } from "./utils";

export function initFontSelector(appState: SmuflState) {
    const fontSelector = document.querySelector('#font-selector')!;

    appState.addEventListener('changed', () => {
        fontSelector.querySelector<HTMLAnchorElement>('.font-name')!.innerText = appState.font.name
    });
    fontSelector.querySelector<HTMLAnchorElement>('.font-name')!.innerText = appState.font.name;

    const itemTemplate = createTemplate<HTMLLIElement>('<li><a class="dropdown-item" href="#"></a></li>')

    const fontSelectorItems = fontSelector.querySelector('ul')!;
    for (const f of Object.values(defaultFonts)) {
        const item = itemTemplate();
        const a = (item.firstElementChild as HTMLAnchorElement);
        a.innerText = f.name;
        fontSelectorItems.appendChild(item);

        a.onclick = async (e) => {
            e.preventDefault();
            await loadingIndicator(async () => {
                const fontMetadata = await getSmuflFontMetadata(f);
                appState.switchFont(f, fontMetadata);
            })
        }
    }
}