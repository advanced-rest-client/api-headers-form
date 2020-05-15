import { html, LitElement } from 'lit-element';
import { ValidatableMixin } from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import markdownStyles from '@advanced-rest-client/markdown-styles/markdown-styles.js';
import formStyles from '@api-components/api-form-mixin/api-form-styles.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import { help } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@api-components/api-property-form-item/api-property-form-item.js';
import '@advanced-rest-client/arc-marked/arc-marked.js';
import '@anypoint-web-components/anypoint-autocomplete/anypoint-autocomplete.js';
import styles from './ApiHeadersFormItemStyles.js';

/** @typedef {import('@api-components/api-view-model-transformer/src/ApiViewModel').ModelItem} ModelItem */

/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-destructuring */

/**
 * Tests whether autocomplete element should be rendered.
 * @param {HTMLElement} input Target element for autocomplete
 * @param {object[]=} suggestions List of suggestions.
 * @return {boolean} True when has the input and some suggestions.
 */
function renderAutocomplete(input, suggestions) {
  return !!(input && suggestions && suggestions.length);
}

/**
 * Headers form item.
 *
 * Provides UI to enter headers data and autocomplete function for both header
 * names and values.
 *
 * @mixes ValidatableMixin
 * @extends LitElement
 */
export class ApiHeadersFormItem extends ValidatableMixin(LitElement) {
  get styles() {
    return [markdownStyles, formStyles, styles];
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
       * Prohibits rendering of the documentation (the icon and the
       * description).
       * Note, Set is separately for `api-view-model-transformer`
       * component as this only affects "custom" items.
       */
      noDocs: { type: Boolean },
      /**
       * When set the editor is in read only mode.
       */
      readOnly: { type: Boolean },
      /**
       * Enables compatibility with Anypoint components.
       */
      compatibility: { type: Boolean },
      /**
       * @deprecated Use `compatibility` instead
       */
      legacy: { type: Boolean },
      /**
       * Enables Material Design outlined style
       */
      outlined: { type: Boolean },
    };
  }

  get legacy() {
    return this.compatibility;
  }

  set legacy(value) {
    this.compatibility = value;
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
  }

  constructor() {
    super();
    this.value = '';
    this.noDocs = false;
    this.readOnly = false;
    this.isCustom = false;
    this.outlined = false;
    this.required = false;
  }

  /**
   * Toggles documentation (if available)
   */
  toggleDocs() {
    this.docsOpened = !this.docsOpened;
    this._gaEvent('Headers form', `Toggle docs ${this.docsOpened}`);
  }

  /**
   * Dispatches `name-changed` event.
   * @param {string} value A value to notify
   */
  _notifyNameChange(value) {
    this.dispatchEvent(
      new CustomEvent('name-changed', {
        detail: { value },
      })
    );
  }

  /**
   * Dispatches `value-changed` event.
   * @param {string} value A value to notify
   */
  _notifyValueChange(value) {
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value },
      })
    );
  }

  /**
   * Handler for header name field focus. It sets `_nameInput` property and
   * requests for header names suggestions to render the autocomplete.
   * @param {CustomEvent} e
   */
  _headerNameFocus(e) {
    if (this.readOnly || this._nameInput) {
      return;
    }
    this._nameInput = /** @type HTMLInputElement */ (e.currentTarget ||
      e.target);
    this._setNameSuggestions(this._nameInput.value);
  }

  /**
   * A handler called when the user selects a suggestion.
   * @param {CustomEvent} e
   */
  _onHeaderNameSelected(e) {
    const { value } = e.detail;
    this.name = value.value || value;
    this._notifyNameChange(this.name);
  }

  /**
   * Handler for autocomplete element. Query the datastore for suggestions.
   *
   * @param {CustomEvent} e Autocomplete event
   */
  _headerNameHandler(e) {
    const target = /** @type HTMLInputElement */ (e.target);
    const value = e.detail ? e.detail.value : target.value;
    this._setNameSuggestions(value);
  }

  /**
   * Queries and sets suggestions for name.
   * @param {String} query The header name to query for.
   */
  _setNameSuggestions(query) {
    const suggestions = this._queryHeaderNameSuggestions(query);
    if (!suggestions || !suggestions.length) {
      this._nameSuggestions = undefined;
      this._nameSuggestionsOpened = false;
      return;
    }
    this._nameSuggestions = suggestions.map(item => {
      return {
        value: item.key,
        display: item.key,
      };
    });
  }

  /**
   * Dispatches `query-headers` custom event to retreive from the application
   * headers definition.
   *
   * `api-headers-form` element contains `arc-definitions` element that
   * listens for this event.
   *
   * @param {string} q Header name to query for
   * @return {object[]} Headers definition or empty array
   */
  _queryHeaderNameSuggestions(q) {
    const ev = new CustomEvent('query-headers', {
      detail: {
        type: 'request',
        query: q,
        headers: undefined,
      },
      cancelable: true,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(ev);
    return ev.detail.headers;
  }

  _getValidity() {
    let selector = 'api-property-form-item[data-type="';
    selector += this.isCustom ? 'custom' : 'typed';
    selector += '"]';
    const input = this.shadowRoot.querySelector(selector);
    // @ts-ignore
    return input && input.validate ? input.validate() : true;
  }

  /**
   * Updates value suggestions for custom values.
   *
   * @param {String} name Header name
   */
  _nameChanged(name) {
    if (!name) {
      this._valueSuggestions = undefined;
      return;
    }
    if (this.__valueQueryHeaders) {
      clearTimeout(this.__valueQueryHeaders);
    }
    this.__valueQueryHeaders = setTimeout(() => {
      this.__valueQueryHeaders = null;
      const info = this._queryHeaderNameSuggestions(this.name);
      this._updateValueAutocomplete(info);
      if (!this.noDocs) {
        this._updateHeaderDocs(info);
      }
    });
  }

  /**
   * Updates header value autocomplete if header definition contains
   * the `autocomplete` entry. It only sets the autocomplete value when
   * only one header has been found for current input.
   *
   * @param {object[]} headers List of received headers from headers query
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
      if (!this._valueInput) {
        this._valueInput = this.shadowRoot.querySelector(
          'api-property-form-item'
        );
      }
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
    const model = /** @type ModelItem */ (this.model);
    if (!model) {
      return;
    }
    if (!info || info.length !== 1) {
      // @ts-ignore
      if (model.hasDescription && model.__ownDescription) {
        this.model.description = undefined;
        this.model.hasDescription = false;
        this.model.__ownDescription = false;
        this.model = { ...this.model };
      }
      return;
    }
    if (model.hasDescription) {
      return;
    }

    this.model.description = info[0].desc;
    this.model.hasDescription = true;
    this.model.__ownDescription = true;
    this.model = { ...this.model };
  }

  /**
   * Handler for name field value change. Sets new name on this element.
   * @param {CustomEvent} e
   */
  _nameValueHandler(e) {
    const { value } = e.detail;
    this.name = value;
    this._notifyNameChange(value);
  }

  /**
   * Handler for name autocomplete opened changed event.
   * It sets opened flag so the element won't request for value suggestions while
   * autocomplete is opened.
   * @param {CustomEvent} e
   */
  _nameSuggestOpenHandler(e) {
    this._nameSuggestionsOpened = e.detail.value;
  }

  /**
   * Handler for value change from the value input
   * @param {CustomEvent} e
   */
  _valueChangeHandler(e) {
    const { value } = e.detail;
    this.value = value;
    this._notifyValueChange(value);
  }

  /**
   * Handler for value autocomplete selection event.
   * Validates the input as after the autocomplete updates the value programatically
   * it won't trigger validation.
   */
  _valueSelectedHandler() {
    setTimeout(() => {
      // @ts-ignore
      this.validate();
    });
  }

  /**
   * If it is custom header then it focuses on the name ionput.
   * Otherwise it focuses on API form item.
   */
  focus() {
    let node;
    if (this.isCustom) {
      node = this.shadowRoot.querySelector('.name-field anypoint-input');
    } else {
      node = this.shadowRoot.querySelector('api-property-form-item');
    }
    if (node) {
      node.focus();
    }
  }

  /**
   * Dispatches `send-analytics` for GA event.
   * @param {String} category
   * @param {String} action
   */
  _gaEvent(category, action) {
    const e = new CustomEvent('send-analytics', {
      bubbles: true,
      composed: true,
      detail: {
        type: 'event',
        category,
        action,
      },
    });
    this.dispatchEvent(e);
  }

  _customTemplate() {
    const {
      name,
      value,
      readOnly,
      compatibility,
      outlined,
      noDocs,
      _nameInput,
      _nameSuggestions,
    } = this;
    const model = /** @type ModelItem */ (this.model || { schema: {} });
    const renderNameSuggestions = renderAutocomplete(
      _nameInput,
      _nameSuggestions
    );
    return html`<div class="custom-wrapper">
      <div class="form-row custom-field">
        <div class="name-field">
          <anypoint-input
            .value="${name || ''}"
            class="param-name"
            type="text"
            pattern="\\S*"
            ?readOnly="${readOnly}"
            ?outlined="${outlined}"
            ?compatibility="${compatibility}"
            required
            invalidmessage="Header name is not valid"
            @value-changed="${this._nameValueHandler}"
            @focus="${this._headerNameFocus}"
            @input="${this._headerNameHandler}"
          >
            <label slot="label">Header name</label>
          </anypoint-input>
          ${renderNameSuggestions
            ? html` <anypoint-autocomplete
                class="name-suggestions"
                .target="${_nameInput}"
                .source="${_nameSuggestions}"
                ?compatibility="${compatibility}"
                @selected="${this._onHeaderNameSelected}"
                @opened-changed="${this._nameSuggestOpenHandler}"
              ></anypoint-autocomplete>`
            : ''}
        </div>
        <div class="value-field">
          <api-property-form-item
            name="${name}"
            data-type="custom"
            .model="${model}"
            .value="${value || ''}"
            ?readonly="${readOnly}"
            ?outlined="${outlined}"
            ?compatibility="${compatibility}"
            @value-changed="${this._valueChangeHandler}"
          ></api-property-form-item>
        </div>
      </div>
      <div class="actions">
        ${!noDocs && model.hasDescription
          ? html`<anypoint-icon-button
              class="hint-icon"
              title="Show documentation"
              ?outlined="${outlined}"
              ?compatibility="${compatibility}"
              @click="${this.toggleDocs}"
            >
              <span class="icon">${help}</span>
            </anypoint-icon-button>`
          : ''}
        <slot name="suffix"></slot>
      </div>
    </div>`;
  }

  _modelTemplate() {
    const {
      name,
      value,
      readOnly,
      required,
      compatibility,
      outlined,
      noDocs,
    } = this;
    const model = /** @type ModelItem */ (this.model || { schema: {} });
    return html`<div class="value-field api-field">
      <api-property-form-item
        .model="${model}"
        name="${name}"
        .value="${value}"
        data-type="typed"
        ?required="${required}"
        ?readonly="${readOnly}"
        ?outlined="${outlined}"
        ?compatibility="${compatibility}"
        @value-changed="${this._valueChangeHandler}"
      ></api-property-form-item>
      ${model.hasDescription && !noDocs
        ? html`<anypoint-icon-button
            class="hint-icon"
            title="Show documentation"
            @click="${this.toggleDocs}"
            ?compatibility="${compatibility}"
          >
            <span class="icon">${help}</span>
          </anypoint-icon-button>`
        : ''}
      <slot name="suffix"></slot>
    </div>`;
  }

  render() {
    const {
      isCustom,
      docsOpened,
      compatibility,
      noDocs,
      _valueInput,
      _valueSuggestions,
    } = this;
    const model = /** @type ModelItem */ (this.model || { schema: {} });
    const hasAutocomplete = renderAutocomplete(_valueInput, _valueSuggestions);
    return html`<style>
        ${this.styles}
      </style>
      ${isCustom ? this._customTemplate() : this._modelTemplate()}
      ${!noDocs && docsOpened && model.description
        ? html`<arc-marked .markdown="${model.description}" sanitize>
            <div slot="markdown-html" class="markdown-body"></div>
          </arc-marked>`
        : ''}
      ${hasAutocomplete
        ? html`<anypoint-autocomplete
            class="value-autocomplete"
            openonfocus
            ?compatibility="${compatibility}"
            @selected="${this._valueSelectedHandler}"
            verticaloffset="-10"
            .positionTarget="${_valueInput}"
            .target="${_valueInput}"
            .source="${_valueSuggestions}"
          ></anypoint-autocomplete>`
        : ''} `;
  }
}
