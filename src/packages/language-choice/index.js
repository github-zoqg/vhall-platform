import LanguageChoice from './src/main';

/* istanbul ignore next */
LanguageChoice.install = function (Vue) {
  Vue.component(LanguageChoice.name, LanguageChoice);
};

export default LanguageChoice;
