<template>
  <div>
    <div id="captchaDom" class="vhsaas-yundun-captcha">
      <!-- <el-input v-model.trim="imgCode"></el-input> -->
    </div>
  </div>
</template>

<script>
  //TODO: 此部分逻辑没有走userServer ,依照原先逻辑修改
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
        capInstance: null // 云盾实例
      };
    },
    computed: {
      imgCode: {
        get() {
          return this.value;
        },
        set(val) {
          console.log(val);
          this.$emit('input', val);
        }
      }
    },
    async mounted() {
      this.init();
    },
    beforeDestroy() {
      this.refreshNECaptha();
    },
    methods: {
      // 初始化易盾
      async init() {
        const that = this;
        const captchaId = this.captchaId;
        const NECaptchaOpts = {
          captchaId,
          element: '#captchaDom',
          mode: 'float',
          width: 270,
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
