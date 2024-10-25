import { COLORS } from './colors';

const { primary, primaryHover, dark, light, bgRowTables, danger, dangerHover, lightBlue, lightBlueHover } = COLORS;
const fontFamily = 'Lato, sans-serif';

export const tokens = {
  interactive: primary,
  'interactive-01': primary,
  'interactive-03': primary,
  'interactive-04': primary,
  'danger-02': danger,
  'danger-01': danger,
  'hover-danger': dangerHover,
  link: primary,
  'link-01': primary,
  focus: primary,
  'link-primary': primary,
  'button-primary': primary,
  'button-tertiary': primary,
  'background-brand': primary,
  'border-interactive': primary,
  'hover-primary': primaryHover,
  'hover-primary-text': primary,
  'hover-tertiary': primaryHover,
  'active-primary': primary,
  'active-tertiary': primary,
  'support-01': danger,
  'support-02': primary,
  'support-04': lightBlue,
  'text-02': dark, // for labels
  'icon-01': primary, // for checkboxes
  'layer-accent': light, // for column headers table
  'layer-accent-hover': light, // for column headers table
  'layer-hover': bgRowTables,
  'code-01-font-family': fontFamily,
  'code-02-font-family': fontFamily,
  'quotation-01-font-family': fontFamily,
  'quotation-02-font-family': fontFamily,
  'fluid-quotation-01-font-famil': fontFamily,
  'fluid-quotation-02-font-famil': fontFamily
};

export const darkToken = {
  highlight: primaryHover,
  'interactive-01': primary,
  'interactive-03': lightBlue,
  'interactive-04': lightBlue,
  'danger-02': danger,
  'danger-01': danger,
  'hover-danger': dangerHover,
  'link-01': lightBlue,
  'background-brand': primary,
  'hover-primary': primaryHover,
  'hover-primary-text': lightBlueHover,
  'hover-tertiary': primaryHover,
  'active-primary': primary,
  'support-02': primary,
  'support-04': lightBlue,
  'inverse-support-04': primary,
  'inverse-link': primary,
  'icon-01': lightBlue
};
