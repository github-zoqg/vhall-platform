import QuestionnaireWatch from './src/watch';

/* istanbul ignore next */
QuestionnaireWatch.install = function(Vue) {
  Vue.component(QuestionnaireWatch.name, QuestionnaireWatch);
};

export default QuestionnaireWatch;
