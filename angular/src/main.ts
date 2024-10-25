import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as _ from 'lodash';
import * as go from 'gojs';

go.Diagram.licenseKey =
  '73f943e3b26e28a800ca0d2b113f69ee1bb37b3a9e811ff25e5741a3ef5f694170c9ed7958d68fc3c0e848fd4a7bc1dc8ec33d799145056cee62d6884ae182f9b43273e1110045d9f7042396cefc29a0fb2b78facae672f08a2c88f2f9b8c5c90ceef38618cb1cab2a790532497eaf55b7ff';

if (environment.production) {
  enableProdMode();
}

const version = _.has(environment, 'version') ? environment['version'] : '0.0.0';
const meta = document.createElement('meta');
meta.setAttribute('version', version);
document.head.appendChild(meta);

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
