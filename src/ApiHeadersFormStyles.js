import { css } from 'lit-element';

export default css`
  :host {
    display: block;
  }

  api-headers-form-item {
    flex: 1;
  }

  .enable-checkbox {
    margin-right: 8px;
  }

  [hidden] {
    display: none !important;
  }

  .empty-info {
    color: var(--empty-info-color, rgba(0, 0, 0, 0.74));
    font-size: var(--empty-info-font-size, 16px);
  }

  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;
