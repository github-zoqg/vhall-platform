<template>
  <div
    :class="`vmp-privacy-compliance scene_${scene} client_${clientType} ${
      $i18n.locale == 'en' ? 'language__en' : ''
    }`"
    v-if="!isEmbed"
  >
    <el-checkbox
      v-if="compType == 1"
      v-model.trim="isCheck"
      @change="emitCheckboxVal"
    ></el-checkbox>
    <i18n :path="compType == 1 ? 'privacy.privacy_1001' : 'privacy.privacy_1002'">
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
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    props: {
      scene: {
        type: String,
        default: 'default'
      },
      clientType: {
        type: String,
        default: 'pc' // PC-网页；mobile - 手机端
      },
      compType: {
        type: [Number, String],
        default: 1 // 1-有勾选；2-无勾选（提交及统一）
      }
    },
    methods: {
      emitCheckboxVal(val) {
        if (this.compType == 1) {
          this.$emit('check', {
            checked: val,
            scene: this.scene
          });
        }
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
      font-size: 12px;
      line-height: 16px;
      color: #8c8c8c;
      word-break: break-word;
    }
    /deep/.el-checkbox {
      margin-right: 8px;
    }
    a {
      text-decoration: none;
      font-weight: 400;
      color: #3562fa;
      transform: matrix(0.99, 0, -0.14, 1, 0, 0);
      &:hover {
        color: #3562fa;
      }
    }
    /* 观看端-登录：展开其它登录方式 */
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
    /* 观看端-注册 */
    &.scene_register {
      margin-top: 38px;
    }
    /* 观看端-抽奖 */
    &.scene_lottery {
      display: block;
      text-align: left;
      align-items: unset;
      justify-content: unset;
    }
    /* 观看端-鉴权白名单 */
    &.scene_auth {
      display: block;
      text-align: left;
      align-items: unset;
      justify-content: unset;
      margin-bottom: 16px;
      padding: 0 10px;
    }
    /* 观看端-报名表单 */
    &.scene_signForm {
      display: block;
      text-align: center;
      align-items: unset;
      justify-content: unset;
    }
    /* 发起端-问卷 */
    &.scene_liveQuestion {
      margin: 12px auto 0 auto;
      padding-bottom: 60px;
      display: block;
      text-align: center;
      align-items: unset;
      justify-content: unset;
    }
    /* 手机端样式设置 */
    &.client_mobile {
      span {
        font-size: 20px;
      }
      a {
        font-size: 20px;
        line-height: 40px;
      }
      &.scene_lottery {
        width: 626px;
        margin: 32px auto 0 auto;
      }
      &.scene_auth {
        margin-top: 32px;
        margin-bottom: 10px;
      }
      &.scene_signForm {
        margin-top: 32px;
        margin-bottom: 0;
        text-align: left;
        &.language__en {
          text-align: center;
        }
      }
    }
    /* PC端样式设置 */
    &.client_pc {
      span {
        font-size: 12px;
      }
      a {
        font-size: 12px;
        line-height: 20px;
      }
      &.scene_lottery {
        position: absolute;
        bottom: 34px;
        padding: 0 0;
        margin: 0 0;
        width: 300px;
        text-align: center;
        span {
          font-size: 12px;
          line-height: 17px;
          color: #ffffff;
        }
        a {
          font-size: 12px;
          line-height: 17px;
        }
      }
      &.scene_signForm {
        margin-top: 12px;
        margin-bottom: 0;
      }
    }
    &.language__en {
      a {
        font-style: italic;
      }
    }
  }
</style>
