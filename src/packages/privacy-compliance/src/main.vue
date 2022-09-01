<template>
  <div :class="`vmp-privacy-compliance scene_${scene} client_${clientType}`">
    <el-checkbox
      v-model.trim="isCheck"
      v-if="scene != 'default'"
      @change="emitCheckboxVal"
    ></el-checkbox>
    <i18n :path="scene != 'default' ? 'privacy.privacy_1001' : 'privacy.privacy_1002'">
      <span place="n">
        <a :href="privacyUrl" target="_blank" rel="noopener noreferrer">
          {{ $t('privacy.privacy_1004') }}
        </a>
      </span>
      <span place="n1">
        <a :href="privacyUPoUrl" target="_blank" rel="noopener noreferrer">
          {{ $t('privacy.privacy_1003') }}
        </a>
      </span>
    </i18n>
  </div>
</template>
<script>
  export default {
    name: 'VmpPrivacyCompliance',
    data() {
      return {
        isCheck: false,
        privacyUrl: `${window.location.protocol}${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}/privacyPolicy`,
        privacyUPoUrl: `${window.location.protocol}${process.env.VUE_APP_WEB_BASE}${process.env.VUE_APP_WEB_KEY}/privacyUPo`
      };
    },
    props: {
      scene: {
        type: String,
        default: 'default'
      },
      clientType: {
        type: String,
        default: 'pc' // PC-网页；mobile - 手机端
      }
    },
    methods: {
      emitCheckboxVal(val) {
        this.$emit('check', {
          checked: val,
          scene: this.scene
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-privacy-compliance {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    text-align: left;
    span,
    a {
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      color: #8c8c8c;
    }
    /deep/.el-checkbox {
      margin-right: 8px;
    }
    /* 登录：展开其它登录方式 */
    &.scene_login {
      line-height: 16px;
      margin-top: 12px;
      align-items: baseline;
      padding-bottom: 2px;
    }
    &.scene_loginDynamic {
      line-height: 16px;
      margin-top: 12px;
      align-items: baseline;
      padding-bottom: 2px;
    }
    /* 注册 */
    &.scene_register {
      margin-top: 38px;
    }
    a {
      text-decoration: none;
      font-style: italic;
      font-weight: 400;
      color: #3562fa;
      transform: matrix(0.99, 0, -0.14, 1, 0, 0);
      &:hover {
        color: #3562fa;
      }
    }
    &.client_mobile {
      a {
        font-size: 20px;
        line-height: 40px;
      }
    }
    &.client_pc {
      a {
        font-size: 12px;
        line-height: 20px;
      }
    }
  }
</style>
