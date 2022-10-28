<!-- 主题选择组件 -->
<template>
  <div class="vmp-language-choice" v-if="!isInGroup && languageList.length > 1">
    <el-dropdown @command="handleChangeLang" placement="bottom">
      <div :class="'vmp-language-choice-lang ' + themeClass.iconClass">
        <span class="vmp-language-choice-lang-icon">
          <i class="vh-saas-iconfont vh-saas-line-multilingual"></i>
        </span>
        <p>{{ lang.label }}</p>
      </div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          :command="item.key"
          :key="index"
          :class="{ active: item.key == lang.key }"
          v-for="(item, index) in languageList"
        >
          <span>{{ item.label }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpLanguageChoice',
    data() {
      return {
        themeClass: {
          bgColor: 'light',
          pageBg: '#cccccc',
          iconClass: 'icon-default' // icon默认色
        },
        lang: {},
        languageList: []
      };
    },
    beforeCreate() {
      this.groupServer = useGroupServer();
    },
    created() {
      const roomBaseServer = useRoomBaseServer();
      // this.setSkinInfo(roomBaseServer.state.skinInfo);
      // 语言列表
      this.languageList = roomBaseServer.state.languages.langList;
      // 当前语言
      this.lang = roomBaseServer.state.languages.lang;
    },
    computed: {
      isInGroup() {
        return this.groupServer.state.groupInitData.isInGroup;
      }
    },
    watch: {},
    methods: {
      // 设置语言
      handleChangeLang(key) {
        localStorage.setItem('lang', key);
        const params = this.$route.query;
        // 如果地址栏中有语言类型，当切换语言时，对应的地址栏参数要改变
        if (params.lang) {
          params.lang = key;
          let sourceUrl =
            window.location.origin + process.env.VUE_APP_ROUTER_BASE_URL + this.$route.path;
          let queryKeys = '';
          for (const k in params) {
            queryKeys += k + '=' + params[k] + '&';
          }
          queryKeys = queryKeys.substring(0, queryKeys.length - 1);
          sourceUrl = sourceUrl + '?' + queryKeys;
          window.location.href = sourceUrl;
        } else {
          window.location.reload();
        }
      },
      // 设置皮肤
      setSkinInfo(skin) {
        if (skin && skin.skin_json_pc && skin.status == 1) {
          this.$nextTick(() => {
            const { pageStyle } = skin.skin_json_pc || '';
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
            color: var(--header-tab-item-font-color) !important;
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
