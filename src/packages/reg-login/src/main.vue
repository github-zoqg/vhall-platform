<template>
  <div class="vmp-reg-login">
    <span @click="handleOpen({ openReg: 0, loginType: '1-0' })">登录&注册</span>
    <el-dialog :visible.sync="visible" :before-close="handleClose">
      <!-- 标题栏 -->
      <template slot="title">
        <div>
          <span>
            <i class="iconfont iconzuofanye"></i>
          </span>
          <span>当前是否是手机{{ isMobile }}</span>
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
      <template v-if="options.openReg == 1">
        <reg></reg>
      </template>
      <template v-if="options.loginType != '0-0'">
        <code-login v-if="panelShows[0] == 1"></code-login>
        <pwd-login v-if="panelShows[1] == 1"></pwd-login>
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
      }
    },
    data() {
      return {
        options: {},
        visible: false // 默认不展示弹出框
      };
    },
    computed: {
      panelShows: function () {
        // 返回数组 [0, 1]，第一位表示 验证码登录。后一位表示密码登录。
        return this.options && this.options.loginType
          ? this.options.loginType.split('-')
          : ['0', '0'];
      },
      isMobile: function () {
        // 若是手机
        return navigator.userAgent.match(
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|wOSBrowser|BrowserNG|WebOS)/i
        );
      }
    },
    methods: {
      // 打开弹出框
      handleOpen(params = {}) {
        this.options = {
          ...{
            openReg: this.openReg,
            loginType: this.loginType,
            loginSort: this.loginSort
          },
          ...params
        };
        console.log('打开登录&注册弹框，初始预设值为', this.options);
        this.visible = true;
      },
      // 关闭弹出框
      handleClose() {
        this.visible = false;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-reg-login {
    display: inline-flex;
    text-align: right;
  }
</style>
