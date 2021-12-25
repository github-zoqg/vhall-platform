e
<!-- 主题选择组件 -->
<template>
  <div class="vmp-language-choice">
    <span>{{ $t('i18n.languageChoice.label') }}</span>
    <select class="vmp-language-choice__select" v-model="lang" @change="handleChange">
      <option v-for="item of choices" :value="item.value" :key="item.value">
        {{ item.label.startsWith('i18n') ? $t(item.label) : item.label }}
      </option>
    </select>
  </div>
</template>
<script>
  export default {
    name: 'VmpLanguageChoice',
    data() {
      return {
        label: '',
        lang: '',
        choices: []
      };
    },
    mounted() {
      this.initConfig();
    },
    watch: {
      lang(newValue) {
        localStorage.setItem('lang', newValue);
      }
    },
    methods: {
      // 初始化配置
      initConfig() {
        const lan = localStorage.getItem('lang');
        if (lan) {
          this.lang = lan;
        }
        const widget = this.$serverConfig && this.$serverConfig[this.cuid];
        if (widget && widget.options) {
          // eslint-disable-next-line
          if (widget.options.hasOwnProperty('choices')) {
            this.choices = widget.options.choices;
          }
          // eslint-disable-next-line
          if (!this.lang && widget.options.hasOwnProperty('lang')) {
            this.lang = widget.options.lang;
          }
        }
        if (!this.lang) {
          this.lang = window.$layoutConfig.lang;
        }
      },
      handleChange: function () {
        window.location.reload();
      }
    }
  };
</script>
<style lang="less">
  .vmp-language-choice {
    display: inline-block;
    color: #fff;
    font-size: 12px;
  }
  .vmp-language-choice__select {
    color: #fff;
    margin: 0 12px 0 6px;
  }
</style>
