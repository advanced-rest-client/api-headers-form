import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin/validatable-mixin.js';
import {ApiFormMixin} from '@api-components/api-form-mixin/api-form-mixin.js';
import {ModelItem} from '@api-components/api-view-model-transformer/src/ApiViewModel';
/**
 * HTTP headers form build from AMF json/ld model.
 */
export declare class ApiHeadersForm {
  readonly styles: CSSResult;
  legacy: boolean;
  value: boolean;
  model: ModelItem[];
  readOnly: boolean;
  onvalue: EventListener|null;
  onmodel: EventListener|null;
  constructor();
  firstUpdated(): void;

  /**
   * Registers an event handler for given type
   *
   * @param eventType Event type (name)
   * @param value The handler to register
   */
  _registerCallback(eventType: String, value: EventListener|null): void;

  /**
   * Appends an empty header to the list.
   */
  add(): void;

  /**
   * Focuses on last form item.
   */
  focusLast(): void;
  _modelChanged(model: ModelItem[], readOnly: boolean): void;

  /**
   * Updates value of the element when model change.
   *
   * @param validate When true then it performs validation after setting
   * the value.
   */
  _updateValue(validate: Boolean): void;

  /**
   * Adds documentation for headers that doesn't have it already.
   *
   * @param model View model
   */
  _autoDescribeModel(model: ModelItem[]): void;

  /**
   * Queries for header information and updates header info if needed.
   *
   * @param item View model item
   * @param index Position of the item in `model` array
   */
  _fillModelDescription(item: ModelItem, index: number): void;

  /**
   * Queries for a header definition.
   *
   * @param name header name to query
   * @returns Header definition or undefined.
   */
  _queryHeaderData(name: String): object|undefined;
  _getValidity(): boolean;
  _enableCheckedHandler(e: CustomEvent): void;
  _nameChangeHandler(e: CustomEvent): void;
  _valueChangeHandler(e: CustomEvent): void;
  _optionalHanlder(e: CustomEvent): void;
  _removeCustom(e: CustomEvent): void;

  /**
   * @returns Template for the element
   */
  render(): TemplateResult;

  /**
   * @returns Template for the empty message
   */
  _emptyMessageTemplate(): TemplateResult|string;

  /**
   * @returns Template for the toggle optional switch
   */
  _optionaToggleTemplate(): TemplateResult|string;

  /**
   * @returns Template for the add header button
   */
  _addCustomTemplate(): TemplateResult|string;

  /**
   * @param item An item definition to render
   * @param index An item's index in the model array
   * @returns Template for a form list item.
   */
  _formItemTemplate(item: ModelItem, index: number): TemplateResult;

  /**
   * @param item An item definition to render
   * @param index An item's index in the model array
   * @returns Template for a item toggle switch
   */
  _itemDisableTemplate(item: ModelItem, index: number): TemplateResult;

  /**
   * @param item An item definition to render
   * @param index An item's index in the model array
   * @returns Template for a remove item icon button
   */
  _itemRemoveIconTemplate(item: ModelItem, index: number): TemplateResult;

  /**
   * @param item An item definition to render
   * @param index An item's index in the model array
   * @returns Template for a api-headers-form-item element
   */
  _headersFormItemTemplate(item: ModelItem, index: number): TemplateResult;
}

export declare interface ApiHeadersForm extends ValidatableMixin, ApiFormMixin, LitElement {
}
