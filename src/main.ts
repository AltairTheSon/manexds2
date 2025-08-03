import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeEn from '@angular/common/locales/en';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Register locales
registerLocaleData(localeAr, 'ar');
registerLocaleData(localeEn, 'en');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));