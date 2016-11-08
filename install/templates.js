const IMPORT_SECTION = `import environment from './environment';
import {I18N} from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';`;

const CONFIGURE_SECTION = `export function configure(aurelia) {
  aurelia.use.plugin('aurelia-i18n', (instance) => {
    instance.i18next.use(Backend);

    return instance.setup({
      backend: {                                 
      loadPath: './locales/{{lng}}/{{ns}}.json',
      },
      lng : 'de',
      attributes : ['t','i18n'],
      fallbackLng : 'en',
      debug : false
    });
  });
  `;

const TRANSLATION_TEMPLATE = `{
  "title": "Aurelia I18N"
}`;

module.exports = {
  IMPORT_SECTION,
  CONFIGURE_SECTION,
  TRANSLATION_TEMPLATE
};
