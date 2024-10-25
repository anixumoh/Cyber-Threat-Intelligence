/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
  interface Locals {
    token?: string;
    cookies?: string;
    user?: import('$lib/types/user').default;
  }
  interface Platform {}
  interface Stuff {}
}

interface Window {
  // /assets/env/env.js
  __env: {
    deployDate: string;
    envFavicon: string;
    envLogotype: string;
    envTitle: string;
    origin: string;
    version?: string;
  };

  grecaptcha: any;

  // amcharts import in app.html
  am4core: typeof import('@amcharts/amcharts4/core');
  am4charts: typeof import('@amcharts/amcharts4/charts');
  am4maps: typeof import('@amcharts/amcharts4/maps');
  am4geodata_worldLow: typeof import('@amcharts/amcharts4-geodata/worldLow');
  am4plugins_annotation: typeof import('@amcharts/amcharts4/plugins/annotation');
  am4themes_animated: typeof import('@amcharts/amcharts4/themes/animated').default;
}

declare module '@amcharts/amcharts4/core?client' {
  import all from '@amcharts/amcharts4/core';
  export = all;
}

declare module '@amcharts/amcharts4/maps?client' {
  import all from '@amcharts/amcharts4/maps';
  export = all;
}

declare module '@amcharts/amcharts4-geodata/worldLow?client' {
  import all from '@amcharts/amcharts4-geodata/worldLow';
  export = all;
}

declare module '@amcharts/amcharts4/charts?client' {
  import all from '@amcharts/amcharts4/charts';
  export = all;
}
declare module '@amcharts/amcharts4/plugins/annotation?client' {
  import all from '@amcharts/amcharts4/plugins/annotation';
  export = all;
}
declare module '@amcharts/amcharts4/themes/animated?client' {
  import all from '@amcharts/amcharts4/themes/animated';
  export = all;
}
