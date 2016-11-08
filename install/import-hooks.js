const fs = require("fs");
const templates = require("./templates");
const Q_SETUP = `Would you like to setup Aurelia I18N automatically?
This includes modifying your src/main.js file as well as creating default translations files`;

class I18NImportHooks {
  constructor() { }

  register(engine, options, projectInfo) {
    this.cliParams = options;
    this.projectInfo = projectInfo;
    this.ui = engine.cliBridge.ui;
  }

  executeScripts() {
    const options = [
      {
        "displayName": "Proceed",
        "description": "Proceed with setting up Aurelia I18N",
        "value": "proceed"
      },
      {
        "displayName": "Skip",
        "description": "Skip automatic setup",
        "value": "skip"
      }
    ];

    const projectMainFile = this.projectInfo.projectRoot + "/src/main.js";

    if (this.cliParams.quiet) {
      this._updateMainJs(projectMainFile);
      this._createTranslationTemplate();

      console.log("Aurelia I18N setup has successfully finished");

      return true;
    } else {
      return this.ui.question(Q_SETUP, options).then(answer => {
        if (answer.value === "proceed") {
          this._updateMainJs(projectMainFile);
          this._createTranslationTemplate();

          console.log("Aurelia I18N setup has successfully finished");
        } else {
          console.log("Automatic setup skipped by user choice");
        }
      }).catch(() => {
        console.log("Aurelia I18N setup failed");
      });
    }
  }

  _updateMainJs(projectMainFile) {
    if (!fs.existsSync(projectMainFile)) {
      console.log("File src/main.js does not exist.");
      return;
    }

    let mainJs = fs.readFileSync(projectMainFile, "utf8");

    // check if imports already exist
    if (mainJs.match(/from\s+['|"]aurelia-i18n['|"]\s*;/) === null) {
      mainJs = mainJs.replace("import environment from './environment';", templates.IMPORT_SECTION);
    }

    // check whether plugin is already initialized
    if (mainJs.match(/plugin\(\s*['|"]aurelia-i18n['|"]/) === null)  {
      mainJs = mainJs.replace("export function configure(aurelia) {", templates.CONFIGURE_SECTION);
    }

    try {
      fs.writeFileSync(projectMainFile, mainJs, "utf8");
    } catch (ex) {
      console.log(`Could not update ${projectMainFile}`);
    }
  }

  _createTranslationTemplate() {
    try {
      if (!fs.existsSync("./locales")) {
        fs.mkdirSync("./locales");
      }

      if (!fs.existsSync("./locales/en")) {
        fs.mkdirSync("./locales/en");
      }

      fs.writeFileSync("./locales/en/translation.json", templates.TRANSLATION_TEMPLATE, "utf8");
    }
    catch (ex) {
      console.log("Could not create the template translation");
    }
  }
}

module.exports = I18NImportHooks;