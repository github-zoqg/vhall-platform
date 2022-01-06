<template>
  <div class="vmp-reg-login">
    <span @click="open({ openReg: 1, loginType: '1-1' })">登录&注册</span>
    <el-dialog
      :custom-class="`vmp-reg-login__dialog ${!isMobile ? 'platform__pc' : 'platform__wap'}`"
      :visible.sync="visible"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <!-- 标题栏插槽 -->
      <template slot="title" v-if="!isMobile">
        <div class="title">
          <i class="iconfont icon-close" @click="close"></i>
        </div>
      </template>
      <!-- 可能场景：
        1、只需要账号密码登录；
        2、只需要手机号验证码登录；（默认）
        3、只需要注册；
        4、账号密码登录 & 注册；
        5、手机号验证码登录 & 注册；
        6、账号密码登录 & 手机号验证码登录；
        7、手机号验证码登录 & 账号密码登录；
        8、账号密码登录 & 手机号验证码登录 & 注册
        9、手机号验证码登录 & 账号密码登录 & 注册； -->
      <template v-if="options.openReg == 1 && activeTag == 'reg'">
        <reg ref="regDom" @handleLink="emitLinkChange"></reg>
      </template>
      <template v-if="options.loginType != '0-0' && activeTag != 'reg'">
        <!-- 验证码 和 密码 登录并存  -->
        <div class="vmp-reg-login__tab" v-if="options.loginType == '1-1'">
          <span :class="activeTag == 'code' ? 'active' : ''" @click="handleChangeTag('code')">
            验证码登录
          </span>
          <em>|</em>
          <span :class="activeTag == 'pwd' ? 'active' : ''" @click="handleChangeTag('pwd')">
            密码登录
          </span>
        </div>
        <code-login
          v-if="panelShows[0] == 1 && activeTag == 'code'"
          :showToReg="options.openReg"
          :showThirdLogin="true"
          @handleLink="emitLinkChange"
        ></code-login>
        <pwd-login
          v-if="panelShows[1] == 1 && activeTag == 'pwd'"
          :showToReg="options.openReg"
          :showThirdLogin="true"
          @handleLink="emitLinkChange"
        ></pwd-login>
      </template>
    </el-dialog>
  </div>
</template>
<script>
  import Reg from './components/reg.vue'; // 注册
  import CodeLogin from './components/code-login.vue'; // 验证码登录
  import PwdLogin from './components/pwd-login.vue'; // 密码登录
  export default {
    name: 'VmpRegLogin',
    components: {
      Reg,
      CodeLogin,
      PwdLogin
    },
    // !!! 当前界面通过props的入参，最终以data中定义的options为准
    props: {
      loginType: {
        required: true,
        default() {
          /* loginType取值范围：
             0-0 不开启登录；
             1-0 只开启验证码登录；
             0-1 只开启密码登录；
             1-1 开启验证码登录 & 开启密码登录。
          */
          return '1-1';
        }
      },
      loginSort: {
        required: true,
        default() {
          /* loginSort取值范围：
             0 验证码登录在前；
             1 密码登录在前。
             PS: 只有loginType 等于 '1-1' 时有效
          */
          return 0;
        }
      },
      openReg: {
        required: true,
        default() {
          /* openReg取值范围：
            0 不支持注册。
            1 支持注册。
          */
          return 1;
        }
      },
      showThirdLogin: {
        required: true,
        default() {
          /* showThirdLogin 是否展示第三方登录-取值范围
             0 -- 不开启第三方登录功能；
             1 -- 开启第三方登录功能。
          */
          return 0;
        }
      }
    },
    data() {
      return {
        isMobile: false, // 是否是手机端展示(true - 手机端；false - PC浏览器)
        options: {}, // !!! 当前界面通过props的入参，最终以这个options里记录的为准
        visible: false, // 默认不展示弹出框
        activeTag: null // activeTag 取值范围：code表示验证码登录；pwd表示密码登录
      };
    },
    computed: {
      panelShows: function () {
        // 返回数组 [0, 1]，第一位表示 验证码登录。后一位表示密码登录。
        return this.options && this.options.loginType
          ? this.options.loginType.split('-')
          : ['0', '0'];
      }
    },
    methods: {
      // 打开弹出框
      open(params = {}) {
        this.isMobile =
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i.test(
            navigator.userAgent
          );
        this.options = {
          ...{
            openReg: this.openReg,
            loginType: this.loginType,
            loginSort: this.loginSort
          },
          ...params
        };
        console.log('打开登录&注册弹框，初始预设值为', this.options);
        // 打开弹出框的时候，设定登录&注册默认tab选中状态 & 组件引入
        this.handleChangeTag(this.options.loginType == '0-1' ? 'pwd' : 'code');
        // 弹出框-open
        this.visible = true;
      },
      // 关闭弹出框
      close() {
        this.visible = false;
      },
      // handleChangeTag 切换登录-tag选项卡
      handleChangeTag(type) {
        this.activeTag = type;
      },
      // emitLinkChange 切换快捷入口组件：去登录 or 去注册
      emitLinkChange(type) {
        // 若跳转为去登录，判断当前组合
        if (type == 'login' && this.options.loginType == '0-1') {
          this.activeTag = 'pwd';
        } else if (type == 'login' && this.options.loginType != '0-1') {
          this.activeTag = 'code';
        } else {
          this.activeTag = 'reg';
        }
      }
    }
  };
</script>
<style lang="less" scoped>
  @theme-red: #fb3a32;
  @theme-title-color: #333333;
  .vmp-reg-login {
    display: inline-flex;
    text-align: right;
  }
  /deep/.el-dialog.vmp-reg-login__dialog {
    width: 90%;
    height: auto;
    max-width: 380px;
    max-height: 526px;
    .el-dialog__header {
      padding: 0 32px;
      height: 60px;
      .title {
        height: 16px;
        line-height: 60px;
        i {
          // TODO： i这个标签的样式需要删掉
          display: inline-block;
          width: 16px;
          height: 16px;
          background: pink;
          color: #666;
          &:hover {
            cursor: pointer;
          }
        }
      }
    }
    .el-dialog__body {
      padding: 0 0;
    }
    &.platform__pc {
      border-radius: 4px;
      .vmp-reg-login__tab {
        text-align: left;
        line-height: initial;
        margin: 0 32px 20px 32px;
        span {
          cursor: pointer;
          display: inline-block;
          vertical-align: top;
          height: 30px;
          font-size: 22px;
          font-weight: 400;
          color: @theme-title-color;
          line-height: 30px;
          padding-bottom: 4px;
          &.active {
            color: @theme-red;
            border-bottom: 2px solid @theme-red;
            border-radius: 1px;
            &.no-border {
              border-bottom: 0;
              font-size: 22px;
              font-weight: 400;
              color: #333333;
              line-height: 30px;
            }
          }
        }
        em {
          font-style: normal;
          display: inline-block;
          vertical-align: top;
          padding: 0 16px;
          font-size: 16px;
          line-height: 22px;
          margin-top: 4px;
        }
      }
    }
    &.platform__wap {
    }
  }
</style>
