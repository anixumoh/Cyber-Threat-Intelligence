import { writable } from "svelte/store";

type Breadcrumb = {
    name: string
    url: string
}

function createBreadcrumbsStore() {
    const store = writable<Breadcrumb[]>([])

    function reset(name: string, url: string) {
        store.set([{name, url}])
    }

    function add(name: string, url: string) {
        store.update(current => ([...current, {name, url}]))
    }

    return {
        ...store,
        reset,
        add
    }
}


const breadcrumbs = createBreadcrumbsStore()

export default breadcrumbs
