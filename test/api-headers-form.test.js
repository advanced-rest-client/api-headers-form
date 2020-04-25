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
import '../api-headers-form.js';

describe('<api-headers-form>', function() {
  async function basicFixture() {
    return await fixture(html `
      <api-headers-form></api-headers-form>
    `);
  }

  async function customFixture() {
    return await fixture(html `
      <api-headers-form allowcustom></api-headers-form>
    `);
  }

  async function allowDisabledFixture() {
    return await fixture(html `
      <api-headers-form allowdisableparams></api-headers-form>
    `);
  }

  describe('Basics', () => {
    const model = {
      binding: 'header',
      name: 'content-type',
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
      value: ''
    };

    it('Renders empty form', async () => {
      const element = await basicFixture();
      const root = element.shadowRoot;
      const node = root.querySelector('.form-item');
      assert.notOk(node);
    });

    it('Adds custom header', async () => {
      const element = await customFixture();
      element.add();
      await nextFrame();
      const root = element.shadowRoot;
      const nodes = root.querySelectorAll('.form-item');
      assert.lengthOf(nodes, 1);
    });

    it('Does not adds custom header when not enabled', async () => {
      const element = await basicFixture();
      element.add();
      await nextFrame();
      const root = element.shadowRoot;
      const nodes = root.querySelectorAll('.form-item');
      assert.lengthOf(nodes, 0);
    });

    it('dispatches GA event when adding custom header', async () => {
      const element = await customFixture();
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element.add();
      const { type, category, action } = spy.args[0][0].detail;
      assert.equal(type, 'event', 'type is set');
      assert.equal(category, 'Headers form', 'category is set');
      assert.equal(action, 'Add custom', 'action is set');
    });

    it('updates the value', async () => {
      const element = await basicFixture();
      element.model = [Object.assign({}, model)];

      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);

      element.model[0].value = 'test';
      element.model = [...element.model];

      await aTimeout();
      assert.equal(spy.args[0][0].detail.value, 'content-type: test');
    });

    it('Disabling item won\'t produce value', async () => {
      const element = await basicFixture();
      element.model = [Object.assign({}, model)];

      const spy = sinon.spy();
      element.addEventListener('value-changed', spy);

      element.model[0].schema.enabled = false;
      element.model = [...element.model];

      await aTimeout();
      assert.equal(spy.args[0][0].detail.value, '');
    });

    it('clears invalid when changing model', async () => {
      const element = await basicFixture();
      element.invalid = true;
      element.model = [Object.assign({}, model)];
      assert.isFalse(element.invalid);
    });

    it('dispatches GA event when removing item', async () => {
      const element = await customFixture();
      element.model = [{
        hasDescription: false,
        name: 'x-1',
        value: 't1',
        schema: {
          isCustom: true,
          enabled: true
        }
      }];
      await nextFrame();
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      const node = element.shadowRoot.querySelector('.delete-icon');
      MockInteractions.tap(node);
      const { type, category, action } = spy.args[0][0].detail;
      assert.equal(type, 'event', 'type is set');
      assert.equal(category, 'Headers form', 'category is set');
      assert.equal(action, 'Remove custom', 'action is set');
    });
  });

  describe('Optional values', () => {
    const model = [{
      binding: 'header',
      name: 'header-without-value',
      hasDescription: true,
      description: 'test',
      required: false,
      schema: {
        enabled: true,
        type: 'string',
        inputLabel: 'x-string',
        isEnum: false,
        isArray: false,
        isBool: false,
        inputType: 'text'
      },
      value: ''
    }, {
      binding: 'header',
      name: 'header-with-value',
      hasDescription: true,
      description: 'test',
      required: false,
      schema: {
        enabled: true,
        type: 'string',
        inputLabel: 'x-string',
        isEnum: false,
        isArray: false,
        isBool: false,
        inputType: 'text'
      },
      value: 'test'
    }];

    it('Not required header is included when not empty', async () => {
      const element = await basicFixture();
      element.model = model;
      await aTimeout();
      const value = element.value;
      assert.isAbove(value.indexOf('header-with-value: test'), -1);
    });

    it('Not required header is not included when empty', async () => {
      const element = await basicFixture();
      element.model = model;
      await aTimeout();
      const value = element.value;
      assert.equal(value.indexOf('header-without-value'), -1);
    });
  });

  describe('__updateValue()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets empty value when model is not computed', () => {
      element.__updateValue();
      assert.equal(element.value, '');
    });

    it('Clear validation state if invalid and no model', () => {
      element.invalid = true;
      element.__updateValue();
      assert.isFalse(element.invalid);
    });

    it('Ignores headers that are not enabled', () => {
      element.model = [{
        name: 'not-enabled',
        value: '',
        schema: {
          enabled: false
        }
      }];
      element.__updateValue();
      assert.equal(element.value, '');
    });

    it('Ignores headers without name and value', () => {
      element.model = [{
        name: '',
        value: '',
        schema: {}
      }];
      element.__updateValue();
      assert.equal(element.value, '');
    });

    it('Ignores headers without value and not required', () => {
      element.model = [{
        name: 'optional',
        value: '',
        required: false,
        schema: {}
      }];
      element.__updateValue();
      assert.equal(element.value, '');
    });

    it('Adds headers without value and required', () => {
      element.model = [{
        name: 'x1',
        value: '',
        required: true,
        schema: {}
      }];
      element.__updateValue();
      assert.equal(element.value, 'x1: ');
    });

    it('Handles array values', () => {
      element.model = [{
        name: 'x1',
        value: ['a', 'b'],
        required: true,
        schema: {}
      }];
      element.__updateValue();
      assert.equal(element.value, 'x1: a,b');
    });

    it('Adds line break', () => {
      element.model = [{
        name: 'x1',
        value: 'a',
        schema: {}
      }, {
        name: 'x2',
        value: 'b',
        schema: {}
      }];
      element.__updateValue();
      assert.equal(element.value, 'x1: a\nx2: b');
    });

    it('Calls validate when argument is passed', () => {
      element.model = [{
        name: 'x1',
        value: 'a',
        schema: {}
      }];
      const spy = sinon.spy(element, 'validate');
      element.__updateValue(true);
      assert.isTrue(spy.called);
    });
  });

  describe('Validation', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('reports invalid when input is required', async () => {
      element.model = [{
        name: 'x1',
        value: '',
        required: true,
        schema: {
          isCustom: false,
        }
      }];
      await nextFrame();
      const result = element.validate();
      assert.isFalse(result);
    });

    it('reports valid when required input has value', async () => {
      element.model = [{
        name: 'x10',
        value: 'test',
        required: true,
        schema: {
          isCustom: false,
        }
      }];
      await nextFrame();
      const result = element.validate();
      assert.isTrue(result);
    });
  });

  describe('Auto API model description', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('adds description properties to a model', async () => {
      element.model = [{
        hasDescription: false,
        name: 'Content-Type',
        value: 'test',
        schema: {
          isCustom: false,
        }
      }];
      const item = element.model[0];
      assert.isNotEmpty(item.description, 'description is set');
      assert.isTrue(item.hasDescription, 'hasDescription is set');
      assert.lengthOf(item.schema.examples, 1, 'example is set');
    });

    it('ignores unknown headers', async () => {
      element.model = [{
        hasDescription: false,
        name: 'x-custom',
        value: 'test',
        schema: {
          isCustom: false,
        }
      }];
      const item = element.model[0];
      assert.isUndefined(item.description, 'description is not set');
      assert.isFalse(item.hasDescription, 'hasDescription is unchanged');
      assert.isUndefined(item.schema.examples, 'example is not set');
    });

    it('ignores already described headers', async () => {
      element.model = [{
        hasDescription: true,
        description: 'test',
        name: 'content-type',
        value: 'test',
        schema: {
          isCustom: false,
        }
      }];
      const item = element.model[0];
      assert.equal(item.description, 'test', 'description is not set');
      assert.isTrue(item.hasDescription, 'hasDescription is unchanged');
    });

    it('ignores manually added headers', async () => {
      element.model = [{
        hasDescription: false,
        name: 'content-length',
        value: 'test',
        schema: {
          isCustom: true,
        }
      }];
      const item = element.model[0];
      assert.isUndefined(item.description, 'description is not set');
      assert.isFalse(item.hasDescription, 'hasDescription is unchanged');
    });
  });

  describe('Allow disable params', () => {
    let element;
    beforeEach(async () => {
      element = await allowDisabledFixture();
      element.model = [{
        hasDescription: false,
        name: 'x-1',
        value: 't1',
        schema: {
          enabled: true,
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-2',
        value: 't2',
        schema: {
          enabled: false,
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-3',
        value: 't3',
        schema: {
          enabled: true,
          isCustom: true,
        }
      }];
      await nextFrame();
    });

    it('Renders enable checkbox', () => {
      const nodes = element.shadowRoot.querySelectorAll('.enable-checkbox');
      assert.lengthOf(nodes, 3);
    });

    it('sets checkboxes checked state', () => {
      const nodes = element.shadowRoot.querySelectorAll('.enable-checkbox');
      assert.isTrue(nodes[0].checked, '#1 is checked');
      assert.isFalse(nodes[1].checked, '#2 is not checked');
      assert.isTrue(nodes[2].checked, '#3 is checked');
    });

    it('updates the model when checked changed', () => {
      const node = element.shadowRoot.querySelectorAll('.enable-checkbox')[0];
      MockInteractions.tap(node);
      assert.isFalse(element.model[0].schema.enabled);
    });

    it('updates the value when checked changed', async () => {
      const node = element.shadowRoot.querySelectorAll('.enable-checkbox')[2];
      MockInteractions.tap(node);
      await aTimeout();
      assert.equal(element.value, 'x-1: t1');
    });

    it('dispatches GA event when changing state', async () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      const node = element.shadowRoot.querySelectorAll('.enable-checkbox')[2];
      MockInteractions.tap(node);
      const { type, category, action } = spy.args[0][0].detail;
      assert.equal(type, 'event', 'type is set');
      assert.equal(category, 'Headers form', 'category is set');
      assert.equal(action, 'Toggle enabled false', 'action is set');
    });
  });

  describe('Updating name', () => {
    let element;
    beforeEach(async () => {
      element = await customFixture();
      element.model = [{
        hasDescription: false,
        name: 'x-1',
        value: 't1',
        schema: {
          isCustom: true,
          enabled: true
        }
      }];
      await nextFrame();
    });

    it('updates the model on name change', () => {
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      const input = node.shadowRoot.querySelector('anypoint-input.param-name');
      input.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: 'altered' }
      }));
      assert.equal(element.model[0].name, 'altered');
    });

    it('updates the value on name change', async () => {
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      node.dispatchEvent(new CustomEvent('name-changed', {
        detail: {
          value: 'altered'
        }
      }));
      await aTimeout();
      assert.equal(element.value, 'altered: t1');
    });

    it('ignores non-custom items', () => {
      element.model[0].schema.isCustom = false;
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      node.name = 'altered';
      assert.equal(element.model[0].name, 'x-1');
    });

    it('ignores when custom items are not enabled', () => {
      element.allowCustom = false;
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      node.name = 'altered';
      assert.equal(element.model[0].name, 'x-1');
    });
  });

  describe('Updating value', () => {
    let element;
    beforeEach(async () => {
      element = await customFixture();
      element.model = [{
        hasDescription: false,
        name: 'x-1',
        value: 't1',
        schema: {
          isCustom: true,
          enabled: true
        }
      }];
      await nextFrame();
    });

    it('updates the model on value change', () => {
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      const input = node.shadowRoot.querySelector('api-property-form-item');
      input.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value: 'altered' }
      }));
      assert.equal(element.model[0].value, 'altered');
    });

    it('updates the value on name change', async () => {
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      node.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
          value: 'altered'
        }
      }));
      await aTimeout();
      assert.equal(element.value, 'x-1: altered');
    });
  });

  describe('Read only model', () => {
    let element;
    beforeEach(async () => {
      element = await customFixture();
      element.model = [{
        hasDescription: false,
        name: 'x-1',
        value: 't1',
        schema: {
          isCustom: true,
          enabled: true
        }
      }];
      await nextFrame();
    });

    it('calls _modelChanged()', () => {
      const spy = sinon.spy(element, '_modelChanged');
      element.readOnly = true;
      assert.deepEqual(spy.args[0][0], element.model, '#1 argument is set');
      assert.isTrue(spy.args[0][1], '#2 argument is set');
    });

    it('ignores change when setting the same value', () => {
      element.readOnly = true;
      const spy = sinon.spy(element, '_modelChanged');
      element.readOnly = true;
      assert.isFalse(spy.called);
    });

    it('makes enable checkbox disabled', async () => {
      element.allowDisableParams = true;
      element.readOnly = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('anypoint-checkbox');
      assert.isTrue(node.disabled);
    });

    it('makes api-headers-form-item read only', async () => {
      element.readOnly = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('api-headers-form-item');
      assert.isTrue(node.readOnly);
    });

    it('makes remove button disabled', async () => {
      element.readOnly = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.delete-icon');
      assert.isTrue(node.disabled);
    });

    it('makes add button disabled', async () => {
      element.readOnly = true;
      element.allowCustom = true;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.action-button');
      assert.isTrue(node.disabled);
    });
  });

  describe('onvalue', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onvalue);
      const f = () => {};
      element.onvalue = f;
      assert.isTrue(element.onvalue === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onvalue = f;
      element.value = 'test';
      element.onvalue = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onvalue = f1;
      element.onvalue = f2;
      element.value = 'test';
      element.onvalue = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onmodel', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onmodel);
      const f = () => {};
      element.onmodel = f;
      assert.isTrue(element.onmodel === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onmodel = f;
      element.model = [];
      element.onmodel = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onmodel = f1;
      element.onmodel = f2;
      element.model = [];
      element.onmodel = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    it('is accessible with custom items', async () => {
      const element = await customFixture();
      element.allowdisableparams = true;
      element.model = [{
        hasDescription: true,
        name: 'x-1',
        value: 't1',
        schema: {
          enabled: true,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-2',
        value: 't2',
        schema: {
          enabled: false,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-3',
        value: 't3',
        schema: {
          enabled: true,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }];
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible when read only', async () => {
      const element = await customFixture();
      element.allowdisableparams = true;
      element.readOnly = true;
      element.model = [{
        hasDescription: true,
        name: 'x-1',
        value: 't1',
        schema: {
          enabled: true,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-2',
        value: 't2',
        schema: {
          enabled: false,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }];
      await nextFrame();
      await assert.isAccessible(element, {
        ignoredRules: ['color-contrast']
      });
    });

    it('is accessible when has optional', async () => {
      const element = await customFixture();
      element.allowdisableparams = true;
      element.allowHideOptional = true;
      element.model = [{
        hasDescription: true,
        name: 'x-1',
        value: 't1',
        required: true,
        schema: {
          enabled: true,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }, {
        hasDescription: false,
        name: 'x-2',
        value: 't2',
        required: false,
        schema: {
          enabled: false,
          inputLabel: 'Enter value',
          isCustom: true,
        }
      }];
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
});
