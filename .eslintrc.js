module.exports = {
  root: true,
  env: {
    node: true,
    browser: true
  },
  globals: {
    BMap: true,
    Vhall: true,
    VhallInteraction: true,
    VhallRTC: true,
    VhallPlayer: true,
    VHall_Questionnaire_Service: true,
    VHall_Questionnaire_Const: true,
    VHPublisher: true,
    VHDocSDK: true,
    VhallChat: true,
    VhallReport: true,
    $: true,
    wx: true,
    WeixinJSBridge: true,
    Vlog: true
  },
  extends: [
    'plugin:vue/essential', // vue2核心的lint的规则
    'eslint:recommended', // eslint的建议规则，参考：https://eslint.bootcss.com/docs/rules/
    // 是@vue/eslint-config-prettier的简写, 告诉eslint把prettier规则做为拓展引用到我们自己的项目中来
    '@vue/prettier'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prettier/prettier': 'error',
    'no-unused-vars': 'off'
  }
};
