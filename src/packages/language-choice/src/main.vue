<!-- 主题选择组件 -->
<template>
  <div class="vmp-language-choice" v-if="mode != 6 && languageList.length > 1">
    <el-dropdown @command="handleChangeLang" placement="bottom">
      <div :class="'vmp-language-choice-lang ' + themeClass.iconClass">
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
          bgColor: 'light',
          pageBg: '#cccccc',
          iconClass: 'icon-default' // icon默认色
        },
        mode: 1,
        lang: {},
        languageList: []
      };
    },
    mounted() {
      this.initConfig();
    },
    created() {
      const roomBaseServer = useRoomBaseServer();
      this.setSkinInfo(roomBaseServer.state.skinInfo);
      this.mode = roomBaseServer.state.watchInitData.webinar.mode;
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
      },
      setSkinInfo(skin) {
        if (skin && skin.skin_json_pc && skin.status == 1) {
          this.$nextTick(() => {
            const { pageStyle } = JSON.parse(skin.skin_json_pc) || '';
            this.themeClass.iconClass = pageStyle == '#FB3A32' ? 'icon-revert' : 'icon-default';
            this.themeClass.pageBg = pageStyle;
          });
        } else {
          this.$nextTick(() => {
            // 默认皮肤
            this.themeClass.pageBg = '#cccccc';
            this.themeClass.iconClass = 'icon-default';
          });
        }
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
      &.icon-default {
        &:hover {
          cursor: pointer;
          i,
          p {
            cursor: pointer;
            color: @font-high-light-normal !important;
          }
        }
      }
      &.icon-revert {
        &:hover {
          cursor: pointer;
          i,
          p {
            cursor: pointer;
            color: @font-dark-second !important;
          }
        }
      }
    }
  }
</style>
