import { createTemplate, type TypedEventTarget } from "./utils";

const searchHelpItemTemplate = createTemplate<HTMLLIElement>(`
    <li>
        <span class="dropdown-item-text">
            <span class="dropdown-item-text fw-bold search-help-label">Label</span>
            <span class="dropdown-item-text search-help-example">Example</span>
        </span>
    </li>
`);

export const searchTypePrefixes = ['glyph', 'codepoint', 'class', 'range'] as const;
export type SearchType = '' | (typeof searchTypePrefixes)[number];

type SearchParameter = {
    key: SearchType;
    label: string;
    example: string;
};

const searchParameterDefinition: SearchParameter[] = [
    {
        key: 'glyph',
        label: 'Glyph name',
        example: 'glyph:"noteheadBlack"',
    },
    {
        key: 'codepoint',
        label: 'Glyph codepoint',
        example: 'codepoint:U+E8A0',
    },
    {
        key: 'class',
        label: 'Glyph class',
        example: 'class:noteheadSet',
    },
    {
        key: 'range',
        label: 'Range name',
        example: 'range:techniquesNoteheads',
    }
]



export type SearchEventOperator = 'contains' | 'equals';
export type SearchEventDetails = { searchType: SearchType, searchText: string, searchOperator: SearchEventOperator };
export class SearchEvent extends CustomEvent<SearchEventDetails> {
    constructor(detail: SearchEventDetails) {
        super('search', {
            detail
        })
    }
}

export const onsearch = new EventTarget() as TypedEventTarget<{
    'search': SearchEvent;
}>;

const search = document.querySelector<HTMLInputElement>('.search-input')!;
const help = document.querySelector<HTMLUListElement>('.search-help')!;

for (const p of searchParameterDefinition) {
    const item = searchHelpItemTemplate();

    item.querySelector<HTMLSpanElement>('.search-help-label')!.innerText = p.label;
    item.querySelector<HTMLSpanElement>('.search-help-example')!.innerText = p.example;

    help.append(item);

    item.onclick = (e) => {
        e.stopPropagation();
    };
}


function searchFromInput(e: Event) {
    e.preventDefault();
    doSearch(search.value)
}
search.onkeyup = searchFromInput;
search.onchange = searchFromInput;
search.oninput = searchFromInput;

export function doSearch(searchText: string) {
    search.value = searchText;

    updateSearchUrl(searchText);

    let searchType: SearchType = '';
    let searchValue = searchText.toLowerCase();
    let searchOperator: SearchEventOperator = 'contains';
    const typeSeparator = searchText.indexOf(':');
    if (typeSeparator > 0) {
        const searchTypeCandidate = searchValue.substring(0, typeSeparator);
        if ((searchTypePrefixes as readonly string[]).includes(searchTypeCandidate)) {
            searchType = searchTypeCandidate as SearchType;
            searchValue = searchValue.substring(typeSeparator + 1);
        }
    }

    if (searchValue.startsWith('"') && searchValue.endsWith('"') ||
        searchValue.startsWith("'") && searchValue.endsWith("'")
    ) {
        searchOperator = 'equals'
        searchValue = searchValue.substring(1, searchValue.length - 1);
    }

    onsearch.dispatchEvent(new SearchEvent({
        searchType,
        searchText: searchValue.trim(),
        searchOperator
    }))
}

function updateSearchUrl(search: string) {
    const urlParams = new URLSearchParams(window.location.search);
    if (search) {
        urlParams.set('search', search);
    } else {
        urlParams.delete('search');
    }
    const newRelativePathQuery = urlParams.size > 0
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
    history.replaceState(null, '', newRelativePathQuery);
}


export function isSearchMatch(details: SearchEventDetails, value: string) {
    switch (details.searchOperator) {
        case "contains":
            return value.toLowerCase().includes(details.searchText);
        case "equals":
            return value.toLowerCase() === details.searchText;
    }
}