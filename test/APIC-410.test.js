import { fixture, assert, html } from '@open-wc/testing';
import '../api-headers-form.js';
import * as AMFLoader from './AMFLoader.js';

/* eslint-disable no-plusplus */

describe('APIC-410', () => {
  async function basicFixture(model, opts = {}) {
    return fixture(html`
      <api-headers-form
        .model="${model}"
        ?narrow="${opts.narrow}"
        ?allowdisableparams="${opts.allowDisableParams}"
        ?allowhideoptional="${opts.allowHideOptional}"
      ></api-headers-form>
    `);
  }

  let amf;
  before(async () => {
    amf = await AMFLoader.load(true, 'APIC-410');
  });

  let model;
  beforeEach(() => {
    const headers = AMFLoader.lookupHeaders(amf, '/accounts', 'get');
    model = AMFLoader.toViewModel(amf, headers);
  });

  it('renders all headers when no hide optional', async () => {
    const element = await basicFixture(model);
    const items = element.shadowRoot.querySelectorAll('.form-item');
    assert.equal(items.length, 6, 'has 6 items');
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const { display } = getComputedStyle(node);
      assert.notEqual(display, 'none', `list item ${i} is not visible`);
    }
  });

  it('renders all headers with narrow', async () => {
    const element = await basicFixture(model, { narrow: true });
    const items = element.shadowRoot.querySelectorAll('.form-item');
    assert.equal(items.length, 6, 'has 6 items');
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const { display } = getComputedStyle(node);
      assert.notEqual(display, 'none', `list item ${i} is not visible`);
    }
  });

  it('hides all headers with no hide optional', async () => {
    const element = await basicFixture(model, { allowHideOptional: true });
    const items = element.shadowRoot.querySelectorAll('.form-item');
    assert.equal(items.length, 6, 'has 6 items');
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const { display } = getComputedStyle(node);
      assert.equal(display, 'none', `list item ${i} is visible`);
    }
  });

  it('hides all headers with no hide optional and narrow', async () => {
    const element = await basicFixture(model, {
      allowHideOptional: true,
      narrow: true,
    });
    const items = element.shadowRoot.querySelectorAll('.form-item');
    assert.equal(items.length, 6, 'has 6 items');
    for (let i = 0; i < items.length; i++) {
      const node = items[i];
      const { display } = getComputedStyle(node);
      assert.equal(display, 'none', `list item ${i} is visible`);
    }
  });
});
