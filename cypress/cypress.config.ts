import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import esBuildPluging from '@badeball/cypress-cucumber-preprocessor/esbuild';
import cucumber from '@badeball/cypress-cucumber-preprocessor';

const { addCucumberPreprocessorPlugin } = cucumber;

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    'file:preprocessor',
    createBundler({
      plugins: [esBuildPluging.default(config)]
    })
  );

  return config;
}

export default defineConfig({
  viewportWidth: 1366,
  viewportHeight: 695,
  execTimeout: 1000000,
  pageLoadTimeout: 100000,
  watchForFileChanges: false,
  retries: 0,
  defaultCommandTimeout: 10000,
  video: true,
  numTestsKeptInMemory: 0,
  e2e: {
    supportFile: './support/e2e.ts',
    setupNodeEvents,
    baseUrl: 'https://tcmaster.blueliv.com',
    specPattern: './e2e/**/*.feature',
    fixturesFolder: './fixtures',
    testIsolation: false
  }
});
