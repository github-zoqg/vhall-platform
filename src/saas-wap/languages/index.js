import zhFront from './modules/zh/frontEndPage';
import zhCode from './modules/zh/code';
import enFront from './modules/en/frontEndPage';
import enCode from './modules/en/code';
import spainFront from './modules/spain/frontEndPage';
import spainCode from './modules/spain/code';
import { zh, en } from './modules/default';
export default {
  zh: {
    ...zhFront,
    ...zhCode,
    ...zh
  },
  en: {
    ...enFront,
    ...enCode,
    ...en
  },
  spain: {
    ...spainFront,
    ...spainCode
  }
};
