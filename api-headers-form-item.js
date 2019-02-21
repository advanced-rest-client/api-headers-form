import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {IronValidatableBehavior} from '@polymer/iron-validatable-behavior/iron-validatable-behavior.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@api-components/api-property-form-item/api-property-form-item.js';
import '@polymer/marked-element/marked-element.js';
import '@advanced-rest-client/markdown-styles/markdown-styles.js';
import '@advanced-rest-client/paper-autocomplete/paper-autocomplete.js';
import '@api-components/api-form-mixin/api-form-styles.js';
/**
 * Headers form item.
 *
 * Provides UI to enter headers data and autocomplete function for both header
 * names and values.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @polymerBehavior IronValidatableBehavior
 */
class ApiHeadersFormItem extends
  mixinBehaviors(IronValidatableBehavior, PolymerElement) {
  static get template() {
    return html`<style include="api-form-styles"></style>
    <style include="markdown-styles">
    :host {
      display: block;
      @apply --api-headers-form-item;
    }

    .form-row {
      @apply --layout-horizontal;
      @apply --layout-center;
      @apply --layout-flex;
    }

    .value-field,
    .name-field {
      position: relative;
    }

    .name-field,
    .value-field {
      @apply --layout-flex;
      @apply --layout-horizontal;
      @apply --layout-start;
    }

    .param-name,
    api-property-form-item {
      @apply --layout-flex;
    }

    api-property-form-item[is-array] {
      margin-top: 8px;
    }

    .param-name {
      margin-right: 12px;
      @apply --api-headers-form-name-input;
    }

    :host([narrow]) .form-row {
      display: block;
    }

    :host([narrow]) .param-name {
      margin-right: 0;
      @apply --api-headers-form-name-input-narrow;
    }

    [hidden] {
      display: none !important;
    }

    :host([is-array]) .value-field {
      @apply --layout-start;
      @apply --api-headers-form-array-parameter;
    }

    paper-icon-button {
      margin-top: var(--api-headers-editore-hint-icon-margin-top, 16px);
    }

    :host([narrow]) paper-icon-button {
      margin-top: var(--api-headers-editore-hint-icon-margin-top-narrow, 16px);
    }

    .custom-wrapper {
      @apply --layout-horizontal;
      @apply --layout-start;
    }

    .docs {
      margin-right: 0;
    }
    </style>
    <template is="dom-if" if="[[!isCustom]]" restamp="">
      <div class="value-field api-field">
        <api-property-form-item model="[[model]]"
          name="[[name]]"
          value="{{value}}"
          data-type="typed"
          required\$="[[required]]"
          on-focus="_customChangeFocus"
          on-blur="_closeAutocomplete" readonly="[[readonly]]"></api-property-form-item>
        <template is="dom-if" if="[[model.hasDescription]]">
          <paper-icon-button class="hint-icon" title="Display documentation"
            icon="arc:help" on-click="toggleDocs"></paper-icon-button>
        </template>
        <slot name="suffix"></slot>
      </div>
    </template>
    <template is="dom-if" if="[[isCustom]]" restamp="">
      <div class="custom-wrapper">
        <div class="form-row custom-field">
          <div class="name-field">
            <paper-input value="{{name}}" label="Header name" class="param-name"
              on-focus="_headerNameFocus" type="text" pattern="\\S*"
              error="Header name is not valid" readonly="[[readonly]]"
              on-input="_queryHeaderName" required=""></paper-input>
            <template is="dom-if" if="[[_renderAutocomplete(_nameInput, _nameSuggestions)]]">
              <paper-autocomplete class="name-suggestions" dynamic-align=""
                vertical-align="bottom" horizontal-align="left" vertical-offset="56"
                target="[[_nameInput]]" source="[[_nameSuggestions]]"
                on-selected="_onHeaderNameSelected" opened="{{_nameSuggestionsOpened}}"></paper-autocomplete>
            </template>
          </div>
          <div class="value-field">
            <api-property-form-item model="[[model]]" name="[[name]]" value="{{value}}"
              data-type="custom" on-focus="_customChangeFocus"
              readonly="[[readonly]]"></api-property-form-item>
          </div>
        </div>
        <div class="actions">
          <template is="dom-if" if="[[model.hasDescription]]">
            <paper-icon-button class="hint-icon" title="Display documentation"
              icon="arc:help" on-click="toggleDocs"></paper-icon-button>
          </template>
          <slot name="suffix"></slot>
        </div>
      </div>
    </template>
    <template is="dom-if" restamp="" id="docsIf" on-dom-change="_docsRendered">
      <div class="docs">
        <iron-collapse opened="[[docsOpened]]" on-transitionend="_docsAnimated">
          <marked-element markdown="[[model.description]]">
            <div slot="markdown-html" class="markdown-body"></div>
          </marked-element>
        </iron-collapse>
      </div>
    </template>
    <template is="dom-if" if="[[_renderAutocomplete(_valueInput, _valueSuggestions)]]">
      <paper-autocomplete class="value-autocomplete"
        on-selected="_onHeaderValueSelected" position-target="[[_valueInput]]"
        dynamic-align="" vertical-align="bottom" horizontal-align="left"
        vertical-offset="56" target="[[_valueInput]]" source="[[_valueSuggestions]]"></paper-autocomplete>
    </template>
    `;
  }
  static get is() {
    return 'api-headers-form-item';
  }
  static get properties() {
    return {
      /**
       * View model for the headers.
       */
      model: Object,
      /**
       * The name of this element.
       */
      name: {
        notify: true,
        type: String,
        observer: '_nameChanged'
      },
      /**
       * The value of this element.
       */
      value: {
        notify: true,
        type: String
      },
      /**
       * If set it renders a narrow layout
       */
      narrow: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      /**
       * True to render documentation (if set in model)
       */
      docsOpened: Boolean,
      /**
       * Set if the header is not specified in the RAML type (is a custom
       * header).
       */
      isCustom: {
        type: Boolean,
        value: false
      },
      /**
       * If set it is render the item control as an array item (adds more
       * spacing to the element)
       */
      isArray: {
        type: Boolean,
        reflectToAttribute: true
      },
      /**
       * List of value suggestion for current header. The list is updated
       * automatically when header name changes
       */
      _valueSuggestions: Array,
      _nameSuggestions: Array,
      // Reference to header value input.
      _valueInput: Object,
      // Reference to the name input field
      _nameInput: Object,
      // True when this model is required
      required: Boolean,
      /**
       * True when suggestions popover is opened
       */
      _nameSuggestionsOpened: Boolean,
      /**
       * Prohibits rendering of the documentation (the icon and the
       * description).
       * Note, Set is separately for `api-view-model-transformer`
       * component as this only affects "custom" items.
       */
      noDocs: Boolean,
      /**
       * When set the editor is in read only mode.
       */
      readonly: Boolean
    };
  }

  // Toggles documentation (if available)
  toggleDocs() {
    if (!this.docsOpened) {
      this.$.docsIf.if = true;
    } else {
      this.docsOpened = false;
    }
  }

  _docsRendered(e) {
    if (!e.target.if) {
      return;
    }
    if (!this.docsOpened) {
      this.docsOpened = true;
    }
  }

  _docsAnimated() {
    if (this.docsOpened === false) {
      this.$.docsIf.if = false;
    }
  }
  // Handler for header name field focus
  _headerNameFocus(e) {
    if (this.readonly || this._nameInput) {
      return;
    }
    this._nameInput = e.currentTarget || e.target;
  }
  /**
   * A handler called when the user selects a suggestion.
   * @param {CustomEvent} e
   */
  _onHeaderNameSelected(e) {
    this.set('name', e.detail.value);
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
    ac.opened = true;
    ac._previousQuery = '';
    ac._valueChanged();
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
    afterNextRender(this, () => {
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
    if (this.readonly) {
      return;
    }
    if (this._valueInput) {
      const ac = this.shadowRoot.querySelector('.value-autocomplete');
      if (!ac) {
        return;
      }
      ac.opened = true;
      ac._previousQuery = '';
      ac._valueChanged();
      return;
    }
    if (this.__customChangeFocus) {
      return;
    }
    this.__customChangeFocus = true;
    this._valueInput = this.shadowRoot.querySelector('api-property-form-item');
    afterNextRender(this, () => {
      const ac = this.shadowRoot.querySelector('.value-autocomplete');
      if (!ac) {
        return;
      }
      ac.opened = true;
      ac._previousQuery = '';
      ac._valueChanged();
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
        this.set('model.description', undefined);
        this.set('model.hasDescription', false);
        this.model.__ownDescription = false;
      }
      return;
    }
    if (model.hasDescription) {
      return;
    }
    this.set('model.description', info[0].desc);
    this.set('model.hasDescription', true);
    this.model.__ownDescription = true;
  }

  /**
   * A handler called when the user selects a value suggestion.
   * @param {CustomEvent} e
   */
  _onHeaderValueSelected(e) {
    this.set('value', e.detail.value);
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
}

window.customElements.define(ApiHeadersFormItem.is, ApiHeadersFormItem);
