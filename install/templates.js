const IMPORT_SECTION = `import environment from './environment';
import {I18N, Backend} from 'aurelia-i18n';`;

const CONFIGURE_SECTION = `export function configure(aurelia) {
  aurelia.use.plugin('aurelia-i18n', (instance) => {
    instance.i18next.use(Backend.with(aurelia.loader));
    return instance.setup({
      backend: {                                 
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      lng: 'en',
      attributes: ['t','i18n'],
      debug: false
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
