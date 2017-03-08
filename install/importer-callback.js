const templates = require('./templates');
const logger = require('aurelia-logging').getLogger('aurelia-i18n');
const Q_SETUP = `Would you like to setup Aurelia I18N automatically?
This includes modifying your src/main.js file as well as creating default translations files`;

module.exports = class {

  static inject() { return ['project', 'ui', 'fs']; };

  constructor(project, ui, fs) {
    this.project = project;
    this.ui = ui;
    this.fs = fs;
  }

  applies() {
    let options = [
      {
        'displayName': 'Proceed',
        'description': 'Proceed with setting up Aurelia I18N',
        'value': 'proceed'
      },
      {
        'displayName': 'Skip',
        'description': 'Skip automatic setup',
        'value': 'skip'
      }
    ];

    return this.ui.question(Q_SETUP, options)
    .then(answer => answer.displayName === 'Proceed');
  }

  execute() {
    let projectMainFile = this.fs.join(this.project.model.paths.root, 'main.js');

    return Promise.all([
      this._updateMainJs(projectMainFile),
      this._createTranslationTemplate()
    ])
    .then(() => {
      return {
        patches: [
          { 'op': 'replace', 'path': '/build/loader/plugins/0/stub', 'value': false}
        ],
        dependencies: [
          {
            'name': 'i18next',
            'path': '../node_modules/i18next/dist/umd',
            'main': 'i18next'
          },
          {
            'name': 'aurelia-i18n',
            'path': '../node_modules/aurelia-i18n/dist/amd',
            'main': 'aurelia-i18n'
          }
        ]
      };
    })
  }

  _updateMainJs(projectMainFile) {
    if (!this.fs.existsSync(projectMainFile)) {
      logger.info(`File src/main.js does not exist (looked for "${projectMainFile}")`);
      return;
    }

    let mainJs = this.fs.readFileSync(projectMainFile, 'utf8');

    // check if imports already exist
    if (mainJs.match(/from\s+['|"]aurelia-i18n['|"]\s*;/) === null) {
      mainJs = mainJs.replace('import environment from \'./environment\';', templates.IMPORT_SECTION);
    }

    // check whether plugin is already initialized
    if (mainJs.match(/plugin\(\s*['|"]aurelia-i18n['|"]/) === null) {
      mainJs = mainJs.replace('export function configure(aurelia) {', templates.CONFIGURE_SECTION);
    }

    return this.fs.writeFile(projectMainFile, mainJs, 'utf8')
    .then(() => logger.debug('updated main.js'))
    .catch(ex => logger.error(`Could not update ${projectMainFile}`, ex));
  }

  _createTranslationTemplate() {
    return this.ensureDir('./locales')
    .then(() => this.ensureDir('./locales/en'))
    .then(() => {
      return this.fs.writeFile('./locales/en/translation.json', templates.TRANSLATION_TEMPLATE, 'utf8');
    })
    .catch(ex => logger.error('Could not create the template translation', ex));
  }

  ensureDir(p) {
    return  this.fs.exists(p)
    .then(exists => {
      if (!exists) {
        return this.fs.mkdir(p);
      }
    });
  }

  get name() {
    return 'aurelia-i18n importer';
  }
};
