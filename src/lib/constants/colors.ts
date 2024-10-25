// Brand colors https://blueliv.atlassian.net/browse/ENG2-252

export const COLORS = {
  white: '#ffffff',
  black: '#000000',
  gray: '#bdbdbd',
  grayHover: '#899295',
  grayMiddle: '#e9ecef',
  textMuted: '#b2b2b2',
  // border: '#ced4da',
  // LIGHT
  light: '#f8f9fa',
  lightHover: '#c9c9c9',
  // DARK
  dark: '#1b2734',
  // SECONDARY
  secondary: '#6c757d',
  // PRIMARY
  primary: 'rgb(15, 74, 101)',
  primaryHover: 'rgb(90, 129, 147)',
  // SUCCESS
  success: '#00b18f',
  successHover: '#009a7c',
  // WARNING
  warning: '#ebcb00',
  warningHover: '#d3b719',
  warningIcon: 'rgb(251, 165, 0)',
  warningStar: '#ffc058',
  // DANGER
  danger: 'rgb(255, 97, 80)',
  dangerHover: 'rgb(253, 145, 136)',
  //   THREATS
  darkThreat: '#343a40',
  successThreat: '#28a745',
  lightBlue: 'rgb(26, 192, 198)',
  lightBlueHover: 'rgb(107, 211, 215)',
  dangerThreat: '#dc3545',
  dangerBgThreat: '#f8d7da',
  grayThreat: '#bdbdbd',
  greenThreat: 'rgb(51, 255, 0)',
  amberThreat: 'rgb(255, 192, 0)',
  severityYellow: '#f2da6a',
  severityOrange: '#FF9800',
  borderCard: 'rgba(0, 0, 0, 0.125)',
  selected: '#eaf1f8',
  selectedText: '#327abd',
  bgRowTables: '#327abd1a',
  btnBgActive: 'rgba(50, 122, 189, 0.2)',
  btnBorderActive: 'rgba(50, 122, 189, 0.5)',
  btnLight: '#495057',
  toolTip: '#393939',
  borderTable: '#dee2e6',
  info: '#0c5460',
  infoBg: '#d1ecf1',

  // LAYOUT
  background: 'var(--cds-ui-background, #ffffff)',
  ui: 'var(--cds-ui-01, #f4f4f4)',
  'hover-ui': 'var(--cds-hover-ui, #e5e5e5)',
  border: 'var(--cds-ui-03, #e0e0e0)',
  text: 'var(--cds-text-01, #161616)',
  interactive: 'var(--cds-interactive-03, rgb(15, 74, 101))',
  'hover-interactive': 'var(--cds-hover-primary-text, rgb(90, 129, 147))',
  link: 'var(--cds-link-01, rgb(15, 74, 101))'
};

// sets CSS vars for easy use in components
// ex: var(--ctip-primary)
export const setRootColors = () => {
  for (const [prop, color] of Object.entries(COLORS)) {
    const varString = `--ctip-${prop}`;
    document.documentElement.style.setProperty(varString, color);
  }
};

// from angular: defaultColorsRGB
export const labelColors = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#C0CA33',
  '#FBC02D',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
  '#008A00',
  '#0050EF',
  '#AA00FF',
  '#E3C800',
  '#6D8764',
  '#D80073',
  '#EE9E9E',
  '#649E9E',
  '#EEEE9E',
  '#EEEEEE'
];
