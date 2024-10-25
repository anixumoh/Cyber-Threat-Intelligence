import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { customAssets } from '$lib/utils/customizations';
import { darkToken, tokens } from '$lib/constants/theme';

const initialStatus = browser ? localStorage.getItem('theme') : 'light';
const darkMode = writable<boolean>(initialStatus === 'dark');
if (browser) {
  darkMode.subscribe((isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // Fix theme tokens
    const tokenKeys = Object.keys(tokens);
    const darkTokenKeys = Object.keys(darkToken);
    const tokensToRemove = isDark
      ? tokenKeys.filter((key) => !darkTokenKeys.includes(key))
      : darkTokenKeys.filter((key) => !tokenKeys.includes(key));
    tokensToRemove.forEach((token) => {
      document.documentElement.style.removeProperty(`--cds-${token}`);
    });
  });
}
export default darkMode;

// const origin = readable('', (set) => {
//   const keys = Object.keys(customAssets);
//   let i = 0;
//   function nextIcon(e) {
//     if (e.key === 'a') {
//       i++;
//       set(keys[i % keys.length]);
//     }
//   }
//   window.addEventListener('keydown', nextIcon);
//   return () => window.removeEventListener('keydown', nextIcon);
// });

export const assets = derived([darkMode], ([$darkMode]) => {
  let logo = '';
  let noDarkLogo = false;
  let darkLogo: string

  if (browser) {
    // const origin = $origin
    const origin = window.__env.origin as keyof typeof customAssets;
    const assets = customAssets[origin] ?? customAssets.default;
    const src = $darkMode ? assets?.darkLogo ?? assets.logo : assets.logo;
    logo = `assets/brand/${src}`;
    darkLogo = `assets/brand/${assets?.darkLogo ?? assets.logo}`;

    if ($darkMode && !assets?.darkLogo) {
      noDarkLogo = true;
    }
  }
  return { logo, noDarkLogo, darkLogo };
});
