import { css } from 'lit-element';

export default css`
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
    align-items: center;
  }

  .param-name,
  api-property-form-item {
    flex: 1;
    margin-right: -8px;
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
    align-items: start;
  }

  :host([isarray]) anypoint-icon-button {
    margin-top: 8px;
  }

  .custom-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;
