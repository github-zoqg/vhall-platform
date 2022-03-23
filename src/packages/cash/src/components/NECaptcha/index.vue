<template>
  <div>
    <div id="captchaDom" class="vhsaas-yundun-captcha">
      <el-input v-model.trim="imgCode"></el-input>
    </div>
  </div>
</template>

<script>
  import { useUserServer } from 'middle-domain';
  export default {
    name: 'NECaptcha',
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        captchaId: 'b7982ef659d64141b7120a6af27e19a0', // 识别
        capInstance: null, // 云盾实例
        useUserServer: {}
      };
    },
    computed: {
      imgCode: {
        get() {
          return this.value;
        },
        set(val) {
          this.$emit('input', val);
        }
      }
    },
    created() {
      this.useUserServer = useUserServer();
    },
    async mounted() {
      // await this.useUserServer.initNECaptcha('#captchaDom');
      this.init();
    },
    beforeDestroy() {
      this.refreshNECaptha();
    },
    methods: {
      // 初始化易盾
      async init() {
        const that = this;
        // const captchaId = await this.useUserServer.getCaptchaId();
        const captchaId = this.captchaId;
        const NECaptchaOpts = {
          captchaId,
          element: '#captchaDom',
          mode: 'float',
          width: 270,
          // FIXME: 网易易顿多语言字段 lang 需要翻译(暂时写死)
          lang: (localStorage.getItem('lang') == '1' ? 'zh-CN' : 'en') || 'zh-CN',
          onReady(instance) {
            console.log('🚀 ~ initNECaptcha onReady ', instance);
            that.capInstance = instance;
          },
          onVerify(err, data) {
            // 易盾验证(成功or失败)
            that.imgCode = data ? data.validate : null;
            err && console.error('🚀 ~ initNECaptcha err ', err);
          }
        };
        window.initNECaptcha(NECaptchaOpts);
      },
      // 重置易盾
      refreshNECaptha() {
        this.imgCode = null;
        this.capInstance?.refresh();
      }
    }
  };
</script>
