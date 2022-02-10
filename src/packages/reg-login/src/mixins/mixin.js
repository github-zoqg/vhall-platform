import { useLoginServer } from 'middle-domain';

export default {
  props: {
    sonTitle: {
      default() {
        return '';
      }
    },
    showToReg: {
      default() {
        /* showToReg取值范围
           0 -- 不开启注册快捷入口；
           1 -- 开启注册快捷入口。
        */
        return 0;
      }
    },
    showThirdLogin: {
      // type: Boolean,
      default() {
        /* showThirdLogin 取值范围
           0 -- 不开启第三方登录功能；
           1 -- 开启第三方登录功能。
        */
        return 0;
      }
    },
    visitorId: {
      // visitorId 游客ID
      type: String,
      default() {
        return '';
      }
    }
  },
  data() {
    const loginServerState = this.loginServer.state; // 响应式注入
    return {
      loginServerState
    };
  },
  computed: {
    captchaReady() {
      return !!this.loginServerState.captchaVal;
    },
    isDownTime() {
      return this.loginServerState.second >= 0;
    }
  },
  methods: {
    resetForm() {
      // 数据重置
      this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
    }
  },
  beforeCreate() {
    this.loginServer = useLoginServer();
  }
  // async mounted() {
  //   await this.loginServer.initNECaptcha();
  // }
};
