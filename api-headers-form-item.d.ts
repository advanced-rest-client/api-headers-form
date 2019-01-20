/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   api-headers-form-item.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-if.d.ts" />
/// <reference path="../polymer/types/lib/elements/dom-repeat.d.ts" />
/// <reference path="../polymer/types/lib/utils/render-status.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../arc-icons/arc-icons.d.ts" />
/// <reference path="../iron-flex-layout/iron-flex-layout.d.ts" />
/// <reference path="../iron-collapse/iron-collapse.d.ts" />
/// <reference path="../iron-validatable-behavior/iron-validatable-behavior.d.ts" />
/// <reference path="../paper-input/paper-input.d.ts" />
/// <reference path="../paper-icon-button/paper-icon-button.d.ts" />
/// <reference path="../api-property-form-item/api-property-form-item.d.ts" />
/// <reference path="../marked-element/marked-element.d.ts" />
/// <reference path="../markdown-styles/markdown-styles.d.ts" />
/// <reference path="../paper-autocomplete/paper-autocomplete.d.ts" />
/// <reference path="../api-form-mixin/api-form-styles.d.ts" />

/**
 * Headers form item.
 *
 * Provides UI to enter headers data and autocomplete function for both header
 * names and values.
 */
declare class ApiHeadersFormItem extends
  Polymer.IronValidatableBehavior(
  Object) {

  /**
   * View model for the headers.
   */
  model: object|null|undefined;

  /**
   * The name of this element.
   */
  name: string|null|undefined;

  /**
   * The value of this element.
   */
  value: string|null|undefined;

  /**
   * If set it renders a narrow layout
   */
  narrow: boolean|null|undefined;

  /**
   * True to render documentation (if set in model)
   */
  docsOpened: boolean|null|undefined;

  /**
   * Set if the header is not specified in the RAML type (is a custom
   * header).
   */
  isCustom: boolean|null|undefined;

  /**
   * If set it is render the item control as an array item (adds more
   * spacing to the element)
   */
  isArray: boolean|null|undefined;

  /**
   * List of value suggestion for current header. The list is updated
   * automatically when header name changes
   */
  _valueSuggestions: any[]|null|undefined;
  _nameSuggestions: any[]|null|undefined;

  /**
   * Reference to header value input.
   */
  _valueInput: object|null|undefined;

  /**
   * Reference to the name input field
   */
  _nameInput: object|null|undefined;

  /**
   * True when this model is required
   */
  required: boolean|null|undefined;

  /**
   * True when suggestions popover is opened
   */
  _nameSuggestionsOpened: boolean|null|undefined;

  /**
   * Prohibits rendering of the documentation (the icon and the
   * description).
   * Note, Set is separately for `api-view-model-transformer`
   * component as this only affects "custom" items.
   */
  noDocs: boolean|null|undefined;

  /**
   * When set the editor is in read only mode.
   */
  readonly: boolean|null|undefined;

  /**
   * Toggles documentation (if available)
   */
  toggleDocs(): void;
  _docsRendered(e: any): void;
  _docsAnimated(): void;

  /**
   * Handler for header name field focus
   */
  _headerNameFocus(e: any): void;

  /**
   * A handler called when the user selects a suggestion.
   */
  _onHeaderNameSelected(e: CustomEvent|null): void;

  /**
   * Handler for autocomplete element. Query the datastore for suggestions.
   *
   * @param e Autocomplete event
   */
  _queryHeaderName(e: Event|null): void;

  /**
   * Dispatches `query-headers` custom event to retreive from the application
   * headers definition.
   *
   * `api-headers-form` element contains `arc-definitions` element that
   * listens for this event.
   *
   * @param q Header name to query for
   * @returns Headers definition or empty array
   */
  _queryHeaderNameSuggestions(q: String|null): any[]|null;
  _getValidity(): any;

  /**
   * Updates value suggestions for custom values.
   *
   * @param name Header name
   */
  _nameChanged(name: String|null): void;

  /**
   * Handler for custom value focus event.
   * Sets the `_valueInput` proeprty for value autosugession
   */
  _customChangeFocus(): void;

  /**
   * Updates header value autocomplete if header definition contains
   * the `autocomplete` entry. It only sets the autocomplete value when
   * only one header has been found for current input.
   *
   * @param headers List of received headers from headers query
   */
  _updateValueAutocomplete(headers: Array<object|null>|null): void;

  /**
   * Updates header description if the header doesn't contain a description
   * already.
   */
  _updateHeaderDocs(info: any): void;

  /**
   * A handler called when the user selects a value suggestion.
   */
  _onHeaderValueSelected(e: any): void;

  /**
   * Closes autocomplete for value when inpur looses focus.
   */
  _closeAutocomplete(): void;
  _renderAutocomplete(input: any, suggestions: any): any;
}

interface HTMLElementTagNameMap {
  "api-headers-form-item": ApiHeadersFormItem;
}
