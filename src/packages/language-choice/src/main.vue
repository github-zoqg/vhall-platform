<!-- 主题选择组件 -->
<template>
  <div class="vmp-language-choice">
    <el-dropdown @command="handleChangeLang" trigger="click" placement="bottom">
      <div class="vmp-language-choice-lang">
        <span class="vmp-language-choice-lang-icon">
          <i class="iconfont iconicon_help_m" :style="{ color: themeClass.pageBg }"></i>
        </span>
        <p :style="{ color: themeClass.pageBg }">简体中文</p>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          :command="item.type"
          :key="index"
          :class="{ active: item.type == lang }"
          v-for="(item, index) in languageList"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
  export default {
    name: 'VmpLanguageChoice',
    data() {
      return {
        themeClass: {
          pageBg: '#3562fa'
        },
        label: '',
        lang: 'zh',
        languageList: [
          {
            type: 'zh',
            label: '简体中文'
          },
          {
            type: 'cn',
            label: '英文'
          }
        ]
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
        const widget = window.$serverConfig && window.$serverConfig[this.cuid];
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
        // if (!this.lang) {
        //   this.lang = window.$layoutConfig.lang;
        // }
      },
      handleChangeLang: function () {
        window.location.reload();
      }
    }
  };
</script>
<style lang="less">
  .vmp-language-choice {
    display: inline-block;
    color: @font-error-low;
    font-size: 12px;
    padding-right: 24px;
    &-lang {
      text-align: center;
      cursor: pointer;
      &-icon {
        i {
          font-size: 16px;
        }
      }
      p {
        font-size: 14px;
        line-height: 14px;
        padding-top: 5px;
      }
      &:hover {
        i,
        p {
          cursor: pointer;
          color: @font-high-light-normal !important;
        }
      }
    }
  }
</style>
