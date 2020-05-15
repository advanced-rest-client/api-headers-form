import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { ApiViewModel } from '@api-components/api-view-model-transformer';

/** @typedef {import('@api-components/api-view-model-transformer/src/ApiViewModel').ModelItem} ModelItem */

class HelperElement extends AmfHelperMixin(Object) {}
const helper = new HelperElement();

/**
 * Loads an API model from a file
 * @param {boolean?} [compact=false] Whether to load compact version of the file
 * @param {string?} [fileName='demo-api'] File name
 * @return {Promise<object>} Promise resolved to an API model.
 */
export async function load(compact = false, fileName = 'demo-api') {
  const suffix = compact ? '-compact' : '';
  const file = `${fileName}${suffix}.json`;
  const l = window.location;
  const url = `${l.protocol}//${l.host}/base/demo/${file}`;
  const response = await fetch(url);
  let data = await response.json();
  if (Array.isArray(data)) {
    [data] = data;
  }
  return data;
}

/**
 * Looks for an endpoint
 * @param {object} model
 * @param {string} endpoint Endpoint's path
 * @return {object}
 */
export function lookupEndpoint(model, endpoint) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  return helper._computeEndpointByPath(webApi, endpoint);
}

/**
 * Looks for an operation
 * @param {object} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {object}
 */
export function lookupOperation(model, endpoint, operation) {
  const endPoint = lookupEndpoint(model, endpoint);
  const opKey = helper._getAmfKey(
    helper.ns.aml.vocabularies.apiContract.supportedOperation
  );
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find(
    (item) =>
      helper._getValue(item, helper.ns.aml.vocabularies.apiContract.method) ===
      operation
  );
}

/**
 * Looks for a payload in an operation
 * @param {object} model
 * @param {string} endpoint Endpoint's path
 * @param {string} operation Operation name (lowercase)
 * @return {object[]}
 */
export function lookupHeaders(model, endpoint, operation) {
  const op = lookupOperation(model, endpoint, operation);
  const expects = helper._computeExpects(op);
  const hKey = helper._getAmfKey(helper.ns.aml.vocabularies.apiContract.header);
  return helper._ensureArray(expects[hKey]);
}

/**
 * Transforms headers AMF model to APIC view model.
 * @param {object} amf
 * @param {object[]} headers Headers
 * @return {ModelItem[]}
 */
export function toViewModel(amf, headers) {
  const factory = new ApiViewModel({ amf });
  return factory.computeViewModel(headers);
}
