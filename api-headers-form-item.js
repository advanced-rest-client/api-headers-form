import { html, css, LitElement } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import formStyles from '@api-components/api-form-mixin/api-form-styles.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@api-components/api-property-form-item/api-property-form-item.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
import '@polymer/iron-icon/iron-icon.js';
/**
 * Headers form item.
 *
 * Provides UI to enter headers data and autocomplete function for both header
 * names and values.
 *
 * @customElement
 * @demo demo/index.html
 * @polymerBehavior IronValidatableBehavior
 */
class ApiHeadersFormItem extends ValidatableMixin(LitElement) {
  static get styles() {
    return [
      markdownStyles,
      formStyles,
      css`
      :host {
        display: block;
      }

      .form-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        flex: 1;
      }

      .value-field,
      .name-field {
        position: relative;
      }

      .name-field,
      .value-field {
        display: flex;
        flex-direction: row;
        flex: 1;
        align-items: flex-start;
      }

      .param-name,
      api-property-form-item {
        flex: 1;
      }

      api-property-form-item[isarray] {
        margin-top: 8px;
      }

      .param-name {
        margin-right: 12px;
      }

      :host([narrow]) .form-row {
        display: block;
      }

      :host([narrow]) .param-name {
        margin-right: 0;
      }

      [hidden] {
        display: none !important;
      }

      :host([isarray]) .value-field {
        align-items: flex-start;
      }

      anypoint-icon-button {
        margin-top: var(--api-headers-editore-hint-icon-margin-top, 16px);
      }

      :host([narrow]) anypoint-icon-button {
        margin-top: var(--api-headers-editore-hint-icon-margin-top-narrow, 16px);
      }

      .custom-wrapper {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
      }

      .docs {
        margin-right: 0;
      }
      `
    ];
  }

  _customTemplate() {
    const {
      model,
      name,
      value,
      readOnly,
      _nameInput,
      _nameSuggestions,
      _nameSuggestionsOpened
    } = this;
    const renderNameSuggestions = this._renderAutocomplete(_nameInput, _nameSuggestions);
    return html`<div class="custom-wrapper">
      <div class="form-row custom-field">
        <div class="name-field">
          <anypoint-input
            .value="${name || ''}"
            class="param-name"
            type="text"
            pattern="\\S*"
            ?readOnly="${readOnly}"
            required
            @value-changed="${this._nameValueHandler}"
            @focus="${this._headerNameFocus}"
            invalidmessage="Header name is not valid"
            @input="${this._queryHeaderName}">
            <label slot="label">Header name</label>
          </anypoint-input>
          ${renderNameSuggestions ? html`
            <anypoint-autocomplete
              class="name-suggestions"
              .target="${_nameInput}"
              .source="${_nameSuggestions}"
              .opened="${_nameSuggestionsOpened}"
              @selected="${this._onHeaderNameSelected}"
              @opened-changed="${this._nameSuggestOpenHandler}"></anypoint-autocomplete>` : undefined}
        </div>
        <div class="value-field">
          <api-property-form-item
            name="${name}"
            data-type="custom"
            .model="${model}"
            .value="${value || ''}"
            ?readonly="${readOnly}"
            @value-changed="${this._valueChangeHandler}"
            @focus="${this._customChangeFocus}"></api-property-form-item>
        </div>
      </div>
      <div class="actions">
        ${model.hasDescription ? html`<anypoint-icon-button
          class="hint-icon"
          title="Show documentation"
          @click="${this.toggleDocs}">
          <iron-icon icon="arc:help"></iron-icon>
        </anypoint-icon-button>` : undefined}
        <slot name="suffix"></slot>
      </div>
    </div>`;
  }

  _modelTemplate() {
    const {
      model,
      name,
      value,
      readOnly,
      required
    } = this;
    return html`<div class="value-field api-field">
      <api-property-form-item
        .model="${model}"
        name="${name}"
        .value="${value}"
        data-type="typed"
        ?required="${required}"
        ?readonly="${readOnly}"
        @value-changed="${this._valueChangeHandler}"
        @focus="${this._customChangeFocus}"
        @blur="${this._closeAutocomplete}"></api-property-form-item>
        ${model.hasDescription ? html`<anypoint-icon-button
          class="hint-icon"
          title="Show documentation"
          @click="${this.toggleDocs}">
          <iron-icon icon="arc:help"></iron-icon>
        </anypoint-icon-button>` : undefined}
      <slot name="suffix"></slot>
    </div>`;
  }

  render() {
    const {
      model,
      isCustom,
      docsOpened,
      _valueInput,
      _valueSuggestions
    } = this;

    const hasUtocomplete = this._renderAutocomplete(_valueInput, _valueSuggestions);
    return html`
    ${isCustom ? this._customTemplate() : this._modelTemplate()}

    ${docsOpened && model.description ? html`<arc-marked .markdown="${model.description}">
      <div slot="markdown-html" class="markdown-body"></div>
    </arc-marked>` : undefined}

    ${hasUtocomplete ? html`<anypoint-autocomplete
      class="value-autocomplete"
      @selected="${this._onHeaderValueSelected}"
      .positionTarget="${_valueInput}"
      .target="${_valueInput}"
      .source="${_valueSuggestions}"></anypoint-autocomplete>` : undefined}
    `;
  }

  static get properties() {
    return {
      /**
       * View model for the headers.
       */
      model: { type: Object },
      /**
       * The name of this element.
       */
      name: { type: String },
      /**
       * The value of this element.
       */
      value: { type: String },
      /**
       * If set it renders a narrow layout
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * True to render documentation (if set in model)
       */
      docsOpened: { type: Boolean },
      /**
       * Set if the header is not specified in the RAML type (is a custom
       * header).
       */
      isCustom: { type: Boolean },
      /**
       * If set it is render the item control as an array item (adds more
       * spacing to the element)
       */
      isArray: { type: Boolean, reflect: true },
      /**
       * List of value suggestion for current header. The list is updated
       * automatically when header name changes
       */
      _valueSuggestions: { type: Array },
      _nameSuggestions: { type: Array },
      // Reference to header value input.
      _valueInput: { type: Object },
      // Reference to the name input field
      _nameInput: { type: Object },
      // True when this model is required
      required: { type: Boolean },
      /**
       * True when suggestions popover is opened
       */
      _nameSuggestionsOpened: { type: Boolean },
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       * Note, Set is separately for `api-view-model-transformer`
       * component as this only affects "custom" items.
       */
      noDocs: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean }
    };
  }

  get name() {
    return this._name;
  }

  set name(value) {
    const old = this._name;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._name = value;
    this.requestUpdate('name', old);
    this._nameChanged(value);
    this.dispatchEvent(new CustomEvent('name-changed', {
      detail: {
        value
      }
    }));
  }

  get value() {
    return this._value;
  }

  set value(value) {
    const old = this._value;
    /* istanbul ignore if */
    if (old === value) {
      return;
    }
    this._value = value;
    this.requestUpdate('value', old);
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: {
        value
      }
    }));
  }

  constructor() {
    super();
    this.value = '';
  }

  // Toggles documentation (if available)
  toggleDocs() {
    this.docsOpened = !this.docsOpened;
  }

  // Handler for header name field focus
  _headerNameFocus(e) {
    if (this.readOnly || this._nameInput) {
      return;
    }
    this._nameInput = e.currentTarget || e.target;
  }
  /**
   * A handler called when the user selects a suggestion.
   * @param {CustomEvent} e
   */
  _onHeaderNameSelected(e) {
    this.name = e.detail.value;
  }
  /**
   * Handler for autocomplete element. Query the datastore for suggestions.
   *
   * @param {Event} e Autocomplete event
   */
  _queryHeaderName(e) {
    const suggestions = this._queryHeaderNameSuggestions(e.detail.value);
    if (!suggestions || !suggestions.length) {
      this._nameSuggestions = undefined;
      this._nameSuggestionsOpened = false;
      return;
    }
    this._nameSuggestions = suggestions.map((item) => {
      return {
        value: item.key,
        display: item.key
      };
    });
    const ac = this.shadowRoot.querySelector('.name-suggestions');
    if (!ac) {
      return;
    }
    ac.renderSuggestions();
  }
  /**
   * Dispatches `query-headers` custom event to retreive from the application
   * headers definition.
   *
   * `api-headers-form` element contains `arc-definitions` element that
   * listens for this event.
   *
   * @param {String} q Header name to query for
   * @return {Array} Headers definition or empty array
   */
  _queryHeaderNameSuggestions(q) {
    const ev = new CustomEvent('query-headers', {
      detail: {
        type: 'request',
        query: q
      },
      cancelable: true,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(ev);
    return ev.detail.headers;
  }

  _getValidity() {
    let selector = 'api-property-form-item[data-type="';
    selector += this.isCustom ? 'custom' : 'typed';
    selector += '"]';
    const input = this.shadowRoot.querySelector(selector);
    return input.validate();
  }
  /**
   * Updates value suggestions for custom values.
   *
   * @param {String} name Header name
   */
  _nameChanged(name) {
    const model = this.model;
    if (!name || !model || !model.schema || model.schema.isEnum) {
      this._updateValueAutocomplete();
      if (!this.noDocs) {
        this._updateHeaderDocs();
      }
      return;
    }
    setTimeout(() => {
      const info = this._queryHeaderNameSuggestions(name);
      this._updateValueAutocomplete(info);
      if (!this.noDocs) {
        this._updateHeaderDocs(info);
      }
    });
  }
  /**
   * Handler for custom value focus event.
   * Sets the `_valueInput` proeprty for value autosugession
   */
  _customChangeFocus() {
    if (this.readOnly) {
      return;
    }
    if (this._valueInput) {
      const ac = this.shadowRoot.querySelector('.value-autocomplete');
      if (!ac) {
        return;
      }
      ac.renderSuggestions();
      return;
    }
    if (this.__customChangeFocus) {
      return;
    }
    this.__customChangeFocus = true;
    this._valueInput = this.shadowRoot.querySelector('api-property-form-item');
    setTimeout(() => {
      const ac = this.shadowRoot.querySelector('.value-autocomplete');
      if (!ac) {
        return;
      }
      ac.renderSuggestions();
    });
  }

  /**
   * Updates header value autocomplete if header definition contains
   * the `autocomplete` entry. It only sets the autocomplete value when
   * only one header has been found for current input.
   *
   * @param {Array<Object>} headers List of received headers from headers query
   */
  _updateValueAutocomplete(headers) {
    if (!headers || !headers.length) {
      if (this._valueSuggestions) {
        this._valueSuggestions = undefined;
      }
      return;
    }
    let header;
    for (let i = 0, len = headers.length; i < len; i++) {
      if (headers[i].key.toLowerCase() === this.name.toLowerCase()) {
        header = headers[i];
        break;
      }
    }
    if (header) {
      this._valueSuggestions = header.autocomplete;
    } else {
      this._valueSuggestions = undefined;
    }
  }
  /**
   * Updates header description if the header doesn't contain a description
   * already.
   *
   * @param {Object} info
   */
  _updateHeaderDocs(info) {
    if (this._nameSuggestionsOpened || this.noDocs) {
      return;
    }
    const model = this.model;
    if (!model) {
      return;
    }
    if (!info || info.length !== 1) {
      if (model.hasDescription && model.__ownDescription) {
        this.model.description = undefined;
        this.model.hasDescription = false;
        this.model.__ownDescription = false;
        this.model = Object.assign({}, this.model);
      }
      return;
    }
    if (model.hasDescription) {
      return;
    }

    this.model.description = info[0].desc;
    this.model.hasDescription = true;
    this.model.__ownDescription = true;
    this.model = Object.assign({}, this.model);
  }

  /**
   * A handler called when the user selects a value suggestion.
   * @param {CustomEvent} e
   */
  _onHeaderValueSelected(e) {
    this.value = e.detail.value;
  }
  /**
   * Closes autocomplete for value when inpur looses focus.
   */
  _closeAutocomplete() {
    if (!this._valueInput) {
      return;
    }
    if (this.__closingAutocomplete) {
      return;
    }
    this.__closingAutocomplete = true;
    setTimeout(() => {
      this.__closingAutocomplete = false;
      const ac = this.shadowRoot.querySelector('.value-autocomplete');
      if (!ac) {
        return;
      }
      ac.opened = false;
    }, 250);
  }

  _renderAutocomplete(input, suggestions) {
    return !!(input && suggestions && suggestions.length);
  }

  _nameValueHandler(e) {
    this.name = e.target.value;
  }

  _nameSuggestOpenHandler(e) {
    this._nameSuggestionsOpened = e.target.value;
  }

  _valueChangeHandler(e) {
    this.value = e.target.value;
  }
}

window.customElements.define('api-headers-form-item', ApiHeadersFormItem);
