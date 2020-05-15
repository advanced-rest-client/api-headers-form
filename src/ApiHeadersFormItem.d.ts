import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';

/**
 * Tests whether autocomplete element should be rendered.
 *
 * @param input Target element for autocomplete
 * @param suggestions List of suggestions.
 * @returns True when has the input and some suggestions.
 */
declare function renderAutocomplete(input: HTMLElement, suggestions: object[]): boolean;

/**
 * Headers form item.
 *
 * Provides UI to enter headers data and autocomplete function for both header
 * names and values.
 */
export declare class ApiHeadersFormItem {
  readonly styles: CSSResult;
  legacy: boolean;
  name: string;
  value: any;
  constructor();
  render(): TemplateResult;

  /**
   * Toggles documentation (if available)
   */
  toggleDocs(): void;

  /**
   * Dispatches `name-changed` event.
   *
   * @param value A value to notify
   */
  _notifyNameChange(value: string): void;

  /**
   * Dispatches `value-changed` event.
   *
   * @param value A value to notify
   */
  _notifyValueChange(value: string): void;

  /**
   * Handler for header name field focus. It sets `_nameInput` property and
   * requests for header names suggestions to render the autocomplete.
   */
  _headerNameFocus(e: CustomEvent): void;

  /**
   * A handler called when the user selects a suggestion.
   */
  _onHeaderNameSelected(e: CustomEvent): void;

  /**
   * Handler for autocomplete element. Query the datastore for suggestions.
   *
   * @param e Autocomplete event
   */
  _headerNameHandler(e: CustomEvent): void;

  /**
   * Queries and sets suggestions for name.
   *
   * @param query The header name to query for.
   */
  _setNameSuggestions(query: String): void;

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
  _queryHeaderNameSuggestions(q: string): object[];
  _getValidity(): boolean;

  /**
   * Updates value suggestions for custom values.
   *
   * @param name Header name
   */
  _nameChanged(name: string): void;

  /**
   * Updates header value autocomplete if header definition contains
   * the `autocomplete` entry. It only sets the autocomplete value when
   * only one header has been found for current input.
   *
   * @param headers List of received headers from headers query
   */
  _updateValueAutocomplete(headers: object[]): void;

  /**
   * Updates header description if the header doesn't contain a description
   * already.
   */
  _updateHeaderDocs(info: object): void;

  /**
   * Handler for name field value change. Sets new name on this element.
   */
  _nameValueHandler(e: CustomEvent): void;

  /**
   * Handler for name autocomplete opened changed event.
   * It sets opened flag so the element won't request for value suggestions while
   * autocomplete is opened.
   */
  _nameSuggestOpenHandler(e: CustomEvent): void;

  /**
   * Handler for value change from the value input
   */
  _valueChangeHandler(e: CustomEvent): void;

  /**
   * Handler for value autocomplete selection event.
   * Validates the input as after the autocomplete updates the value programatically
   * it won't trigger validation.
   */
  _valueSelectedHandler(): void;

  /**
   * If it is custom header then it focuses on the name ionput.
   * Otherwise it focuses on API form item.
   */
  focus(): void;

  /**
   * Dispatches `send-analytics` for GA event.
   */
  _gaEvent(category: String, action: String): void;
  _customTemplate(): any;
  _modelTemplate(): any;
}

export declare interface ApiHeadersFormItem extends ValidatableMixin, LitElement {
}
