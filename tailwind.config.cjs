module.exports = {
  darkMode: "class",
  content: ['./src/{lib,routes}/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // LAYOUT
        'ctip-background': 'var(--ctip-background)',
        'ctip-ui': 'var(--ctip-ui)',
        'ctip-border': 'var(--ctip-border)',
        'ctip-text': 'var(--ctip-text)',
        'ctip-interactive': 'var(--ctip-interactive)',
        'ctip-hover-interactive': 'var(--ctip-hover-interactive)',
        'ctip-hover-ui': 'var(--ctip-hover-ui)',
        'ctip-link': 'var(--ctip-link)',

        // COLORS
        "ctip-lightBlue" : "var(--ctip-lightBlue)",
        "ctip-lightBlueHover" : "var(--ctip-lightBlueHover)",
        'ctip-white': 'var(--ctip-white)',
        'ctip-black': 'var(--ctip-black)',
        'ctip-gray': 'var(--ctip-gray)',
        'ctip-grayHover': 'var(--ctip-grayHover)',
        'ctip-grayMiddle': 'var(--ctip-grayMiddle)',
        'ctip-textMuted': 'var(--ctip-textMuted)',
        'ctip-light': 'var(--ctip-light)',
        'ctip-lightHover': 'var(--ctip-lightHover)',
        'ctip-dark': 'var(--ctip-dark)',
        'ctip-secondary': 'var(--ctip-secondary)',
        'ctip-primary': 'var(--ctip-primary)',
        'ctip-primaryHover': 'var(--ctip-primaryHover)',
        'ctip-success': 'var(--ctip-success)',
        'ctip-successHover': 'var(--ctip-successHover)',
        'ctip-warning': 'var(--ctip-warning)',
        'ctip-warningHover': 'var(--ctip-warningHover)',
        'ctip-warningIcon': 'var(--ctip-warningIcon)',
        'ctip-warningStar': 'var(--ctip-warningStar)',
        'ctip-danger': 'var(--ctip-danger)',
        'ctip-dangerHover': 'var(--ctip-dangerHover)',
        'ctip-darkThreat': 'var(--ctip-darkThreat)',
        'ctip-successThreat': 'var(--ctip-successThreat)',
        'ctip-dangerThreat': 'var(--ctip-dangerThreat)',
        'ctip-dangerBgThreat': 'var(--ctip-dangerBgThreat)',
        'ctip-grayThreat': 'var(--ctip-grayThreat)',
        'ctip-greenThreat': 'var(--ctip-greenThreat)',
        'ctip-amberThreat': 'var(--ctip-amberThreat)',
        'ctip-severityYellow': 'var(--ctip-severityYellow)',
        'ctip-severityOrange': 'var(--ctip-severityOrange)',
        'ctip-borderCard': 'var(--ctip-borderCard)',
        'ctip-selected': 'var(--ctip-selected)',
        'ctip-selectedText': 'var(--ctip-selectedText)',
        'ctip-bgRowTables': 'var(--ctip-bgRowTables)',
        'ctip-btnBgActive': 'var(--ctip-btnBgActive)',
        'ctip-btnBorderActive': 'var(--ctip-btnBorderActive)',
        'ctip-btnLight': 'var(--ctip-btnLight)',
        'ctip-toolTip': 'var(--ctip-toolTip)',
        'ctip-borderTable': 'var(--ctip-borderTable)',
        'ctip-info': 'var(--ctip-info)',
        'ctip-infoBg': 'var(--ctip-infoBg)',
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  },
  important: '#svelte-app'
};
