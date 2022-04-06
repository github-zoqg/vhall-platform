import Questionnaire from './src/main';

/* istanbul ignore next */
Questionnaire.install = function (Vue) {
  Vue.component(Questionnaire.name, Questionnaire);
};

export default Questionnaire;
