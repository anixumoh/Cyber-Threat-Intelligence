import { writable } from 'svelte/store';
const cookiesStore = writable<string>(null);
export default cookiesStore;
