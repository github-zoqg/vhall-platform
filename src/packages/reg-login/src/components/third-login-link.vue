<template>
  <div class="vmp-third-layout" v-if="options.qqPath || options.wxPath">
    <p :class="`vmp-third-remark height__${way}`">{{ $t('login.login_1008') }}</p>
    <div class="vmp-third__login__way">
      <div class="vmp-third__login__third">
        <a
          :href="options.qqPath"
          class="vmp-third__login__qq"
          :title="$t('login.login_1009')"
          v-if="options.qqPath"
        ></a>
        <a
          :href="options.wxPath"
          class="vmp-third__login__wechat"
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
        roomId: this.$route.params.id,
        options: {}
      };
    },
    methods: {
      setPath(params = {}) {
        this.options = {
          qqPath: this.qqPath,
          wxPath: this.wxPath,
          ...params
        };
      },
      // 统一默认入口
      init() {
        // 第三方登录后 回调地址 - 待确定如何书写
        // 前端回传地址
        const jumpUrlPath = `https:${process.env.VUE_APP_WAP_WATCH}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.roomId}`;
        // 第三方登录地址
        this.options.wxPath =
          `https:${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/weixin?source=pc&jump_url=` +
          encodeURIComponent(jumpUrlPath);
        this.options.qqPath =
          `https:${process.env.VUE_APP_BIND_BASE_URL}/v3/commons/auth/qq?source=pc&jump_url=` +
          encodeURIComponent(jumpUrlPath);
      }
    },
    created() {
      this.init();
    }
  };
</script>
<style lang="less">
  .vmp-third-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    .vmp-third-remark {
      margin-right: 16px;
    }
  }
  .vmp-third-remark {
    text-align: center;
    height: 17px;
    font-size: 12px;
    font-weight: 400;
    color: #999;
    line-height: 17px;
    &.height__max {
      padding-top: 8px;
    }
    &.height__min {
      padding-top: 0;
    }
  }
  .vmp-third__login__way {
    margin-top: 8px;
  }
  .vmp-third__login__third {
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
  .vmp-third__login__qq {
    background: url('../images/qq@2x.png') center center no-repeat;
    background-size: 100% 100%;
    margin-right: 16px;
    &:hover {
      background: url('../images/qq_hover@2x.png') center center no-repeat;
      background-size: 100% 100%;
    }
  }
  .vmp-third__login__wechat {
    background: url('../images/wechat@2x.png') center center no-repeat;
    background-size: 100% 100%;
    &:hover {
      background: url('../images/wechat_hover@2x.png') center center no-repeat;
      background-size: 100% 100%;
    }
  }
</style>
