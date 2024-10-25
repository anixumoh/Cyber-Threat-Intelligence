# #CTIP-UI Threat Intelligence - User Interface

This application is a user interface that communicates with [ThreatCompass](https://gitlab.blueliv.net/java/ThreadCompass)

## Development

Install dependencies with
```
npm install
```

Start the app with

```
npm start
```


# Stack
- [SvelteKit](https://kit.svelte.dev/) as web framework
- [Tailwind CSS](https://tailwindcss.com/) for the styles
- [Carbon Design System](https://carbon-components-svelte.onrender.com/) for the UI components
- [Felte](https://felte.dev/) + [Yup](https://github.com/jquense/yup) for form validation
- [Day.js](https://day.js.org/) for dates

Parts of the app is in this stack, that is being migrated to the new one
- [Angular 14](https://angular.io/) as web framework, migrating to SvelteKit, to be removed
- [Bootstrap CSS](https://getbootstrap.com/) for styling, to be removed
- [Moment.js](https://momentjs.com/) for dates, to be removed

# Recommended VSCode extensions
- Svelte
- Tailwind
- Headwind
- Paste JSON as Code
- Prettier

# Testing

HOST=https://tcmaster.blueliv.com ./smoke_test.sh
