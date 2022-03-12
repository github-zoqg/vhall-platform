import QuestionnaireWap from './src/main';

/* istanbul ignore next */
QuestionnaireWap.install = function (Vue) {
  Vue.component(QuestionnaireWap.name, QuestionnaireWap);
};

export default QuestionnaireWap;
