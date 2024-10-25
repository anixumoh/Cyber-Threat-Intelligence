import { writable } from 'svelte/store';
const tokenStore = writable<string>(null);
export default tokenStore;
