const NECaptchaLanguages = {
  computed: {
    // 与网易易盾图片插件语言匹配
    langNECaptcha() {
      const locale = sessionStorage.getItem('locale');
      let lang = 'zh-CN';
      switch (locale) {
        case 'zh':
          lang = 'zh-CN';
          break;
        case 'spain':
          lang = 'es';
          break;
        default:
          lang = locale;
      }
      return lang;
    }
  }
};
export default NECaptchaLanguages;
