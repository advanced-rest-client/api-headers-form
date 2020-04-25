import {
  fixture,
  assert,
  nextFrame,
  aTimeout,
  html
} from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import '@advanced-rest-client/arc-definitions/arc-definitions.js';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions.js';
import '../api-headers-form-item.js';

describe('<api-headers-form-item>', function() {
  async function basicFixture() {
    return await fixture(html `
      <api-headers-form-item name="test-name" value="test-value"></api-headers-form-item>
    `);
  }

  async function requiredFixture() {
    return await fixture(html `
      <api-headers-form-item name="test-name" required></api-headers-form-item>
    `);
  }

  async function customFixture() {
    return await fixture(html `
      <api-headers-form-item name="test-name" value="test-value" iscustom></api-headers-form-item>
    `);
  }

  async function definitionsFixture() {
    return await fixture(html `
      <div>
        <arc-definitions></arc-definitions>
        <api-headers-form-item iscustom></api-headers-form-item>
      </div>
    `);
  }

  async function noDocsFixture() {
    return await fixture(html `
      <api-headers-form-item name="test-name" nodocs></api-headers-form-item>
    `);
  }

  function genModel(name) {
    name = name || 'test-name';
    return {
      binding: 'header',
      name,
      hasDescription: true,
      description: 'test',
      required: true,
      schema: {
        enabled: true,
        type: 'string',
        inputLabel: 'x-string',
        isEnum: false,
        isArray: false,
        isBool: false,
        inputType: 'text'
      },
      value: 'test-value'
    };
  }

  describe('Basic tests', function() {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
      element.model = genModel();
      await nextFrame();
    });

    it('renders form field for API defined item', () => {
      const node = element.shadowRoot.querySelector('.api-field');
      assert.ok(node);
    });

    it('renders documentation toggle icon', () => {
      const node = element.shadowRoot.querySelector('.hint-icon');
      assert.ok(node);
    });

    it('des not render arc-marked for docs when not opened', async () => {
      const node = element.shadowRoot.querySelector('arc-marked');
      assert.notOk(node);
    });

    it('renders arc-marked for docs when opened', async () => {
      element.toggleDocs();
      await nextFrame();
      const node = element.shadowRoot.querySelector('arc-marked');
      assert.ok(node);
    });

    it('dispatches GA event when docs are toggled', async () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element.toggleDocs();
      const { type, category, action } = spy.args[0][0].detail;
      assert.equal(type, 'event', 'type is set');
      assert.equal(category, 'Headers form', 'category is set');
      assert.equal(action, 'Toggle docs true', 'action is set');
    });
  });

  describe('Required', function() {
    let element;
    beforeEach(async function() {
      element = await requiredFixture();
      const m = genModel();
      m.value = '';
      element.model = m;
      await nextFrame();
    });

    it('does not validate the input', async () => {
      const result = element.validate();
      assert.isFalse(result);
    });

    it('sets invalid property when invalid', async () => {
      element.validate();
      assert.isTrue(element.invalid);
    });
  });

  describe('Custom value', () => {
    let element;
    beforeEach(async function() {
      element = await customFixture();
      element.model = genModel();
      await nextFrame();
    });

    it('Renders custom section', () => {
      const node = element.shadowRoot.querySelector('.custom-wrapper');
      assert.ok(node);
    });

    it('Renders name input', () => {
      const node = element.shadowRoot.querySelector('.param-name');
      assert.ok(node);
    });

    it('Renders value input', () => {
      const node = element.shadowRoot.querySelector('.custom-wrapper api-property-form-item');
      assert.ok(node);
    });
  });

  describe('_updateHeaderDocs()', () => {
    let element;
    beforeEach(async function() {
      element = await customFixture();
      element.model = genModel();
      await nextFrame();
    });

    it('Does nothing when noDocs', () => {
      element.noDocs = true;
      element._updateHeaderDocs([]);

      assert.isTrue(element.model.hasDescription);
    });

    it('Does nothing when _nameSuggestionsOpened', () => {
      element._nameSuggestionsOpened = true;
      element._updateHeaderDocs([]);

      assert.isTrue(element.model.hasDescription);
    });

    it('Clears the description when __ownDescription flag', () => {
      element.model.__ownDescription = true;
      element._updateHeaderDocs([]);

      assert.isFalse(element.model.hasDescription);
      assert.isUndefined(element.model.description);
    });

    it('Won\'t clear the description when no __ownDescription flag', () => {
      element._updateHeaderDocs([]);

      assert.isTrue(element.model.hasDescription);
      assert.equal(element.model.description, 'test');
    });

    it('Updates description from suggestions', () => {
      element.model.hasDescription = false;
      element._updateHeaderDocs([{
        desc: 'updated-desc'
      }]);

      assert.isTrue(element.model.hasDescription);
      assert.equal(element.model.description, 'updated-desc');
    });

    it('Sets __ownDescription flag', () => {
      element.model.hasDescription = false;
      element._updateHeaderDocs([{
        desc: 'updated-desc'
      }]);

      assert.isTrue(element.model.__ownDescription);
    });
  });

  describe('_headerNameFocus()', () => {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
      element.model = genModel();
      await nextFrame();
    });

    it('Does nothing when readonly', () => {
      element.readOnly = true;
      element._headerNameFocus({
        target: 'test'
      });
      assert.isUndefined(element._nameInput);
    });

    it('Does nothing when _nameInput is set', () => {
      element._nameInput = 'test';
      element._headerNameFocus({
        target: 'other'
      });
      assert.equal(element._nameInput, 'test');
    });

    it('Sets value from currentTarget', () => {
      element._headerNameFocus({
        currentTarget: 'other'
      });
      assert.equal(element._nameInput, 'other');
    });

    it('Sets value from target', () => {
      element._headerNameFocus({
        target: 'other'
      });
      assert.equal(element._nameInput, 'other');
    });
  });

  describe('_onHeaderNameSelected()', () => {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
      element.model = genModel();
    });

    it('sets the name from simple string suggestion', () => {
      element._onHeaderNameSelected({
        detail: {
          value: 'test-value'
        }
      });
      assert.equal(element.name, 'test-value');
    });

    it('sets the name from object suggestion', () => {
      element._onHeaderNameSelected({
        detail: {
          value: {
            value: 'test-value'
          }
        }
      });
      assert.equal(element.name, 'test-value');
    });
  });

  describe('_headerNameHandler()', () => {
    let element;
    beforeEach(async function() {
      const region = await definitionsFixture();
      element = region.querySelector('api-headers-form-item');
      element.model = genModel();
      await nextFrame();
    });

    it('Calls _queryHeaderNameSuggestions()', () => {
      const spy = sinon.spy(element, '_queryHeaderNameSuggestions');
      element._headerNameHandler({
        detail: {
          value: 'test'
        }
      });
      assert.equal(spy.args[0][0], 'test');
    });

    it('Clean up when no suggestions', () => {
      element._nameSuggestions = [];
      element._nameSuggestionsOpened = true;
      element._headerNameHandler({
        detail: {
          value: 'no way to have a suggestion'
        }
      });
      assert.isUndefined(element._nameSuggestions);
      assert.isFalse(element._nameSuggestionsOpened);
    });

    it('Sets _nameSuggestions', () => {
      element._headerNameHandler({
        detail: {
          value: 'accept-encoding'
        }
      });
      assert.lengthOf(element._nameSuggestions, 1);
      assert.deepEqual(element._nameSuggestions, [{
        value: 'Accept-Encoding',
        display: 'Accept-Encoding'
      }]);
    });
  });

  describe('Name autocomplete', () => {
    let element;
    beforeEach(async function() {
      const region = await definitionsFixture();
      element = region.querySelector('api-headers-form-item');
      element.model = {
        binding: 'header',
        name: '',
        value: '',
        schema: {}
      };
      await nextFrame();
    });

    it('sets name suggestions on name field focus', () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      assert.typeOf(element._nameSuggestions, 'array', 'Name suggestions are set');
    });

    it('sets _nameInput property on name field focus', () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      assert.equal(element._nameInput, input, 'Name suggestions are set');
    });

    it('renders autocomplete on name field focus', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete');
      assert.ok(node, 'autocomplete is rendered');
    });

    it('autocomplete is closed on focus', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete');
      assert.isFalse(node.opened);
    });

    it('opens autocomplete on input', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      await nextFrame();
      input.value = 'c';
      input.dispatchEvent(new CustomEvent('input'));
      // Suggestions opens after a timeout.
      await aTimeout();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete');
      assert.isTrue(node.opened);
    });

    it('opens autocomplete when empty input on arrow down', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      await nextFrame();
      MockInteractions.keyDownOn(input, 40, [], 'ArrowDown');
      // Suggestions opens after a timeout.
      await aTimeout();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete');
      assert.isTrue(node.opened);
    });

    it('sets autocomplete element when name changes and has suggestions', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      input.value = 'c';
      input.dispatchEvent(new CustomEvent('input'));
      await nextFrame();
      assert.typeOf(element._nameSuggestions, 'array', 'Name suggestions are set');
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete');
      assert.ok(node, 'autocomplete is rendered');
    });

    it('Updates name when suggestion is selected', async () => {
      const input = element.shadowRoot.querySelector('anypoint-input.param-name');
      MockInteractions.focus(input);
      input.value = 'content-ty';
      await nextFrame();
      input.dispatchEvent(new CustomEvent('input'));
      await aTimeout();
      const node = element.shadowRoot.querySelector('anypoint-autocomplete anypoint-item');
      MockInteractions.tap(node);
      await nextFrame();
      assert.equal(element.name, 'Content-Type');
    });
  });

  describe('Value autocomplete', () => {
    let element;
    beforeEach(async function() {
      const region = await definitionsFixture();
      element = region.querySelector('api-headers-form-item');
      element.model = {
        binding: 'header',
        name: 'content-type',
        value: '',
        schema: {}
      };
      element.name = 'content-type';
      await nextFrame();
    });

    it('has value suggestions for the name', async () => {
      assert.typeOf(element._valueSuggestions, 'array');
    });

    it('suggestions are not opened by default', async () => {
      const node = element.shadowRoot.querySelector('.value-autocomplete');
      assert.isFalse(node.opened);
    });

    it('opens suggestions on arrow down', async () => {
      const input = element.shadowRoot.querySelector('api-property-form-item');
      MockInteractions.keyDownOn(input, 40, [], 'ArrowDown');
      // Suggestions opens after a timeout.
      await aTimeout();
      const node = element.shadowRoot.querySelector('.value-autocomplete');
      assert.isTrue(node.opened);
    });

    // This fails on Safari for some wired reason.
    // No time to investigate now.
    it.skip('updates value from suggestion', async () => {
      const input = element.shadowRoot.querySelector('api-property-form-item');
      MockInteractions.keyDownOn(input, 40, [], 'ArrowDown');
      // Suggestions opens after a timeout.
      await aTimeout();

      const node = element.shadowRoot.querySelector('.value-autocomplete anypoint-item');
      MockInteractions.tap(node);
      await nextFrame();
      assert.equal(element.value, node.innerText.trim());
    });
  });

  describe('focus()', () => {
    let element;
    beforeEach(async function() {
      element = await basicFixture();
      element.model = {
        binding: 'header',
        name: '',
        value: '',
        schema: {}
      };
      await nextFrame();
    });

    it('calls focus on the form item', () => {
      const input = element.shadowRoot.querySelector('api-property-form-item');
      const spy = sinon.spy(input, 'focus');
      element.focus();

      assert.isTrue(spy.called);
    });

    it('calls focus on the input', async () => {
      element.isCustom = true;
      await nextFrame();
      const input = element.shadowRoot.querySelector('anypoint-input');
      const spy = sinon.spy(input, 'focus');
      element.focus();

      assert.isTrue(spy.called);
    });
  });

  describe('No docs property', () => {
    let element;
    beforeEach(async function() {
      element = await noDocsFixture();
      element.model = genModel();
      await nextFrame();
    });

    it('does not render description element', () => {
      const node = element.shadowRoot.querySelector('arc-marked');
      assert.notOk(node);
    });

    it('does not render hint toggle button', () => {
      const node = element.shadowRoot.querySelector('.hint-icon');
      assert.notOk(node);
    });

    it('does not render hint toggle button for custom', async () => {
      element.isCustom = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.hint-icon');
      assert.notOk(node);
    });
  });

  describe('a11y', () => {
    it('is accessible with custom name and value and autocomplete', async () => {
      const region = await definitionsFixture();
      const element = region.querySelector('api-headers-form-item');
      element.name = 'content-type';
      element.value = 'test';
      element.isCustom = true;
      element.model = {
        binding: 'header',
        name: 'content-type',
        value: '',
        schema: {
          isCustom: true,
          inputLabel: 'Enter value'
        }
      };
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible with API model', async () => {
      const region = await definitionsFixture();
      const element = region.querySelector('api-headers-form-item');
      element.name = 'content-type';
      element.value = '';
      element.isCustom = false;
      element.model = {
        binding: 'header',
        name: 'content-type',
        value: '',
        schema: {
          isCustom: false,
          inputLabel: 'Enter value'
        }
      };
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });
  });

  describe('compatibility mode', () => {
    it('sets compatibility on item when setting legacy', async () => {
      const element = await basicFixture();
      element.legacy = true;
      assert.isTrue(element.legacy, 'legacy is set');
      assert.isTrue(element.compatibility, 'compatibility is set');
    });

    it('returns compatibility value from item when getting legacy', async () => {
      const element = await basicFixture();
      element.compatibility = true;
      assert.isTrue(element.legacy, 'legacy is set');
    });
  });

  describe('_gaEvent()', () => {
    const CAT = 'test-category';
    const ACT = 'test-action';

    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches event with required arguments', () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element._gaEvent(CAT, ACT);
      assert.isTrue(spy.called, 'event is dispatched');
      const { type, category, action } = spy.args[0][0].detail;
      assert.equal(type, 'event', 'type is set');
      assert.equal(category, CAT, 'category is set');
      assert.equal(action, ACT, 'action is set');
    });
  });
});
