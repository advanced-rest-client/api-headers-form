import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import '../api-headers-form.js';

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();

    this.initObservableProperties([
      'headers', 'noDocs', 'amfHeaders', 'viewModel', 'narrow', 'allowDisableParams',
      'allowCustom', 'allowHideOptional', 'readOnly',
      'demoOutlined', 'demoCompatibility'
    ]);

    this.componentName = 'api-headers-form';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this._viewModelChanged = this._viewModelChanged.bind(this);
    this._headersHandler = this._headersHandler.bind(this);
    this._modelHandler = this._modelHandler.bind(this);
    this._mainDemoStateHandler = this._mainDemoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
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
    const webApi = this.helper._computeWebApi(this.amf);
    const method = this.helper._computeMethodModel(webApi, selected);
    const expects = this.helper._computeExpects(method);
    const hKey = this.helper._getAmfKey(this.helper.ns.raml.vocabularies.http + 'header');
    const headers = this.helper._ensureArray(expects[hKey]);
    this.amfHeaders = headers;
  }

  _updateModel() {
    if (!this.amf) {
      return;
    }
    this.amfHeaders = undefined;
    document.querySelector('api-view-model-transformer').clearCache();
    setTimeout(() => {
      this.setData(this._currentSelection);
    }, 1);
  }

  _viewModelChanged(e) {
    this.viewModel = e.detail.value;
  }

  _headersHandler(e) {
    this.headers = e.detail.value;
  }

  _modelHandler(e) {
    this.viewModel = e.detail.value;
  }

  _mainDemoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.demoOutlined = false;
        this.demoCompatibility = false;
        break;
      case 1:
        this.demoOutlined = true;
        this.demoCompatibility = false;
        break;
      case 2:
        this.demoOutlined = false;
        this.demoCompatibility = true;
        break;
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
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
      demoOutlined,
      demoCompatibility
    } = this;
    return html`<section class="documentation-section">
      <h2>API model demo</h2>
      <p>
        This demo lets you preview the API headers form element with various
        configuration options.
      </p>

      <section role="main" class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">
        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._mainDemoStateHandler}"
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
            ?outlined="${demoOutlined}"
            ?compatibility="${demoCompatibility}"></api-headers-form>

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
        </div>
      </section>
    </section>`;
  }

  _standaloneTemplate() {
    return html`<section class="documentation-section">
      <h2>Standalone editor</h2>
      <p>
        The headers editor can be used without providing data model.
      </p>

      <api-headers-form
        slot="content"
        allowdisableparams
        allowcustom
        allowhideoptional></api-headers-form>
    </section>`;
  }

  _render() {
    const {
      amf,
      noDocs,
      amfHeaders
    } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <api-view-model-transformer
        .amf="${amf}"
        .shape="${amfHeaders}"
        @view-model-changed="${this._viewModelChanged}"
        ?nodocs="${noDocs}"></api-view-model-transformer>

      ${this._demoTemplate()}
      ${this._standaloneTemplate()}
      `, document.querySelector('#demo'));
  }
}
const instance = new ApiDemo();
instance.render();
window.demoInstance = instance;
