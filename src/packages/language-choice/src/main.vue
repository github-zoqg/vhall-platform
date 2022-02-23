<!-- 主题选择组件 -->
<template>
  <div class="vmp-language-choice">
    <el-dropdown @command="handleChangeLang" trigger="click" placement="bottom">
      <div class="vmp-language-choice-lang">
        <span class="vmp-language-choice-lang-icon">
          <i
            class="vh-saas-iconfont vh-saas-line-multilingual"
            :style="{ color: themeClass.pageBg }"
          ></i>
        </span>
        <p :style="{ color: themeClass.pageBg }">{{ lang.label }}</p>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          :command="item.key"
          :key="index"
          :class="{ active: item.key == lang.key }"
          v-for="(item, index) in languageList"
        >
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  const langMap = {
    1: {
      label: '简体中文',
      type: 'zh',
      key: 1
    },
    2: {
      label: 'English',
      type: 'en',
      key: 2
    }
  };
  export default {
    name: 'VmpLanguageChoice',
    data() {
      return {
        themeClass: {
          pageBg: '#3562fa'
        },
        lang: {},
        languageList: []
      };
    },
    mounted() {
      this.initConfig();
    },
    created() {
      const roomBaseServer = useRoomBaseServer();
      this.languageList = roomBaseServer.state.languages.langList.map(item => {
        return langMap[item.language_type];
      });
      const curLang = roomBaseServer.state.languages.curLang;
      this.lang =
        langMap[sessionStorage.getItem('lang')] ||
        langMap[this.$route.query.lang] ||
        langMap[curLang.language_type];
      this.$i18n.locale = this.lang.type;
      sessionStorage.setItem('lang', this.lang.type);
    },
    watch: {},
    methods: {
      // 初始化配置
      initConfig() {
        // if (!this.lang) {
        //   this.lang = window.$layoutConfig.lang;
        // }
      },
      handleChangeLang: function (key) {
        sessionStorage.setItem('lang', key);
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
