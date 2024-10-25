import { writable } from 'svelte/store';

const angularIsLoading = writable<boolean>(false);

export default angularIsLoading;
