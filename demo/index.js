import { html } from 'lit-html';
import { ApiDemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ApiViewModel } from '@api-components/api-view-model-transformer';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-headers-form.js';

class ApiDemo extends ApiDemoPage {
  constructor() {
    super();
    this.viewModelTransformer = new ApiViewModel();

    this.initObservableProperties([
      'headers',
      'amfHeaders',
      'viewModel',
      'allowDisableParams',
      'allowCustom',
      'allowHideOptional',
      'readOnly',
      'outlined',
    ]);

    this.componentName = 'api-headers-form';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this._headersHandler = this._headersHandler.bind(this);
    this._modelHandler = this._modelHandler.bind(this);

    this.allowDisableParams = false;
    this.allowCustom = false;
    this.allowHideOptional = false;
    this.readOnly = false;

    // Overrides AMF setter/setter
    Object.defineProperty(this, 'amf', {
      get() {
        return this._amf;
      },
      set(value) {
        this._amf = value;
        this.viewModelTransformer.amf = value;
        this.render();
      },
      enumerable: true,
      configurable: true,
    });
  }

  get noDocs() {
    return this._noDocs;
  }

  set noDocs(value) {
    this._noDocs = value;
    this.viewModelTransformer.noDocs = value;
    if (this.amfHeaders) {
      this.viewModel = this.viewModelTransformer.computeViewModel(
        this.amfHeaders
      );
    }
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this._currentSelection = selected;
      this.setData(selected);
      this.hasData = true;
    } else {
      this.amfHeaders = undefined;
      this.hasData = false;
    }
  }

  setData(selected) {
    const webApi = this._computeWebApi(this.amf);
    const method = this._computeMethodModel(webApi, selected);
    const expects = this._computeExpects(method);
    const hKey = this._getAmfKey(this.ns.aml.vocabularies.apiContract.header);
    const headers = this._ensureArray(expects[hKey]);
    this.amfHeaders = headers;
    this.viewModel = this.viewModelTransformer.computeViewModel(headers);
  }

  _updateModel() {
    if (!this.amf) {
      return;
    }
    this.amfHeaders = undefined;
    this.viewModelTransformer.clearCache();
    setTimeout(() => {
      this.setData(this._currentSelection);
    }, 1);
  }

  _headersHandler(e) {
    this.headers = e.detail.value;
  }

  _modelHandler(e) {
    this.viewModel = e.detail.value;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _toggleMainOption(e) {
    super._toggleMainOption(e);
    const { name } = e.target;
    if (name === 'noDocs') {
      this._updateModel();
    }
  }

  _demoTemplate() {
    const {
      headers,
      noDocs,
      viewModel,
      narrow,
      allowDisableParams,
      allowCustom,
      allowHideOptional,
      readOnly,
      demoStates,
      darkThemeActive,
      outlined,
      compatibility,
    } = this;
    return html` <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the API Request Editor element with various
        configuration options.
      </p>

      <arc-interactive-demo
        .states="${demoStates}"
        @state-chanegd="${this._demoStateHandler}"
        ?dark="${darkThemeActive}"
      >
        <api-headers-form
          slot="content"
          @value-changed="${this._headersHandler}"
          @model-changed="${this._modelHandler}"
          .model="${viewModel}"
          ?narrow="${narrow}"
          ?allowdisableparams="${allowDisableParams}"
          ?allowcustom="${allowCustom}"
          ?allowhideoptional="${allowHideOptional}"
          ?nodocs="${noDocs}"
          ?readOnly="${readOnly}"
          ?outlined="${outlined}"
          ?compatibility="${compatibility}"
        ></api-headers-form>

        <label slot="options" id="mainOptionsLabel">Options</label>
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="narrow"
          @change="${this._toggleMainOption}"
          >Narrow</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowDisableParams"
          @change="${this._toggleMainOption}"
          >Allow disable</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowHideOptional"
          @change="${this._toggleMainOption}"
          >Allow hide</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="allowCustom"
          @change="${this._toggleMainOption}"
          >Allow custom</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="noDocs"
          @change="${this._toggleMainOption}"
          >No inline docs</anypoint-checkbox
        >
        <anypoint-checkbox
          aria-describedby="mainOptionsLabel"
          slot="options"
          name="readOnly"
          @change="${this._toggleMainOption}"
          >Read only</anypoint-checkbox
        >
      </arc-interactive-demo>

      <output>${headers}</output>
    </section>`;
  }

  _standaloneTemplate() {
    return html` <section class="documentation-section">
      <h3>Standalone editor</h3>
      <p>
        The headers editor can be used without providing the data model.
      </p>

      <api-headers-form
        slot="content"
        allowdisableparams
        allowcustom
        allowhideoptional
      ></api-headers-form>
    </section>`;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
      ['APIC-410', 'APIC-410'],
    ].map(
      ([file, label]) => html`
        <anypoint-item data-src="${file}-compact.json"
          >${label} - compact model</anypoint-item
        >
        <anypoint-item data-src="${file}.json">${label}</anypoint-item>
      `
    );
  }

  contentTemplate() {
    return html`
      <h2 class="centered main">API headers form</h2>
      ${this._demoTemplate()} ${this._standaloneTemplate()}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
