<template>
  <div class="vmp-third-layout" v-if="options.qqPath || options.wxPath">
    <p :class="`vmp-third-remark height__${way}`">{{ $t('login.login_1008') }}</p>
    <div class="vmp-login__way">
      <div class="vmp-login__third">
        <a
          :href="options.qqPath"
          class="vmp-login__qq"
          :title="$t('login.login_1009')"
          v-if="options.qqPath"
        ></a>
        <a
          :href="options.wxPath"
          class="vmp-login__wechat"
          :title="$t('login.login_1032')"
          v-if="options.wxPath"
        ></a>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpThirdLoginLink',
    props: {
      qqPath: {
        required: false,
        default() {
          return null;
        }
      },
      wxPath: {
        required: false,
        default() {
          return null;
        }
      },
      way: {
        required: false,
        default() {
          // 传入值范围 max -- padding增加8px；min -- padding不增加。
          return 'max';
        }
      }
    },
    data() {
      return {
        options: {}
      };
    },
    methods: {
      setPath(params = {}) {
        this.options = {
          ...{
            qqPath: this.qqPath,
            wxPath: this.wxPath
          },
          ...params
        };
        console.log('动态设置的第三方请求地址....');
      },
      // 统一默认入口
      init() {
        console.log('默认第三方请求地址....');
        // TODO 后端请求域名 - 待确定如何书写
        const hostPath = process.env.VUE_APP_BIND_BASE_URL + process.env.VUE_APP_WEB_KEY;
        // 第三方登录后 回调地址 - 待确定如何书写
        // 前端回传地址
        const jumpUrlPath = `${window.location.origin}${process.env.VUE_APP_ROUTE_BASE}/lives/middle/${this.$route.params.il_id}?purpose=login`;
        // 第三方登录地址
        this.options.wxPath =
          `${hostPath}/commons/auth/weixin?source=pc&jump_url=` + encodeURIComponent(jumpUrlPath);
        this.options.qqPath =
          `${hostPath}/commons/auth/qq?source=pc&jump_url=` + encodeURIComponent(jumpUrlPath);
      }
    },
    created() {
      this.init();
    }
  };
</script>
<style lang="less">
  @iconpath: '../images';
  .vmp-third-layout {
    margin-top: auto;
  }
  .vmp-third-remark {
    text-align: center;
    height: 17px;
    font-size: 12px;
    font-weight: 400;
    color: #999999;
    line-height: 17px;
    &.height__max {
      padding-top: 8px;
    }
    &.height__min {
      padding-top: 0;
    }
  }
  .vmp-login__way {
    margin-top: 8px;
  }
  .vmp-login__third {
    text-align: center;
    line-height: 30px;
    a {
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      width: 30px;
      height: 30px;
      cursor: pointer;
    }
  }
  .vmp-login__qq {
    background: url('@{iconpath}/qq@2x.png') center center no-repeat;
    background-size: 100% 100%;
    margin-right: 16px;
    &:hover {
      background: url('@{iconpath}/qq_hover@2x.png') center center no-repeat;
      background-size: 100% 100%;
    }
  }
  .vmp-login__wechat {
    background: url('@{iconpath}/wechat@2x.png') center center no-repeat;
    background-size: 100% 100%;
    &:hover {
      background: url('@{iconpath}/wechat_hover@2x.png') center center no-repeat;
      background-size: 100% 100%;
    }
  }
</style>
