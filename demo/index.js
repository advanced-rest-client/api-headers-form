import { html } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@api-components/api-view-model-transformer/api-view-model-transformer.js';
import '../api-headers-form.js';

import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();

    this.initObservableProperties([
      'headers', 'noDocs', 'amfHeaders', 'viewModel', 'narrow', 'allowDisableParams',
      'allowCustom', 'allowHideOptional', 'readOnly'
    ]);

    this._viewModelChanged = this._viewModelChanged.bind(this);
    this._optionChanged = this._optionChanged.bind(this);
    this._headersHandler = this._headersHandler.bind(this);
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
      this._currentSelection = e.detail.selected;
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

  _optionChanged(e) {
    const { name, checked } = e.target;
    this[name] = checked;
    if (name === 'noDocs') {
      this._updateModel();
    }
  }

  _headersHandler(e) {
    this.headers = e.detail.value;
  }

  contentTemplate() {
    const {
      amf,
      headers,
      noDocs,
      amfHeaders,
      viewModel,
      narrow,
      allowDisableParams,
      allowCustom,
      allowHideOptional,
      readOnly
    } = this;
    return html`
    <demo-element id="helper" .amf="${amf}"></demo-element>
    <api-view-model-transformer
      .amf="${amf}"
      .shape="${amfHeaders}"
      @view-model-changed="${this._viewModelChanged}"
      ?nodocs="${noDocs}"></api-view-model-transformer>
    ${this.hasData ?
      html`
      <div class="vertical-section-container centered card">
        <api-headers-form
          @value-changed="${this._headersHandler}"
          .model="${viewModel}"
          ?narrow="${narrow}"
          ?allowdisableparams="${allowDisableParams}"
          ?allowcustom="${allowCustom}"
          ?allowhideoptional="${allowHideOptional}"
          ?nodocs="${noDocs}"
          ?readonly="${readOnly}"></api-headers-form>
        <output>${headers}</output>
      </div>

      <div class="vertical-section-container centered config card" rel="main">
        <h2>Configuration options</h2>
        <paper-toggle-button name="narrow" @change="${this._optionChanged}">Render narrow view</paper-toggle-button>
        <paper-toggle-button name="allowHideOptional" @change="${this._optionChanged}">Allow auto hide optional headers</paper-toggle-button>
        <paper-toggle-button name="allowDisableParams" @change="${this._optionChanged}">Allow disabling parameters</paper-toggle-button>
        <paper-toggle-button name="allowCustom" @change="${this._optionChanged}">Allow custom parameters</paper-toggle-button>
        <paper-toggle-button name="noDocs" @change="${this._optionChanged}">Disable documentation rendering</paper-toggle-button>
        <paper-toggle-button name="readonly" @change="${this._optionChanged}">Read only mode</paper-toggle-button>
      </div>` :
      html`<p>Select HTTP in the navigation to see the demo.</p>`}
    `;
  }
}
const instance = new ApiDemo();
instance.render();
