import type { TypedEventTarget } from "./utils";

export class SearchEvent extends CustomEvent<string> {
    get searchText() {
        return this.detail;
    }

    constructor(searchText: string) {
        super('search', {
            detail: searchText
        })
    }
}

export const onsearch = new EventTarget() as TypedEventTarget<{
    'search': SearchEvent;
}>;

const search = document.querySelector<HTMLInputElement>('nav input[type=search]')!;
function doSearch(e:Event) {
    e.preventDefault();
    onsearch.dispatchEvent(new SearchEvent(search.value))
}

search.onkeyup = doSearch;
search.onchange = doSearch;
search.oninput = doSearch;
