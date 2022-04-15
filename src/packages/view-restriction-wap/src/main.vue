<template>
  <van-popup
    v-model="agreementPopupVisible"
    :closeable="agreement.rule === 1"
    :class="['vmp-view-restriction-wap']"
    :overlay-class="agreement.rule === 0 ? 'vmp-view-restriction-wap-overlay' : ''"
    get-container="body"
  >
    <!-- 标题 -->
    <div class="restriction-title">
      {{ agreement.title }}
    </div>
    <!-- 内容 -->
    <div :class="['scroll-content', { 'more-content': agreement.rule === 1 }]">
      <div class="restriction-content" v-html="agreement.content"></div>
      <!-- 声明协议 -->
      <div
        v-if="agreement.statement_content"
        class="restriction-law"
        v-html="agreement.statement_content"
      ></div>
    </div>
    <div :class="['restriction-control', { 'more-btn': agreement.rule === 1 }]">
      <template v-if="!agreement.rule">
        <span @click.stop="agree">{{ $t('other.other_1017') }}</span>
        <span @click.stop="disagree">{{ $t('other.other_1018') }}</span>
      </template>
      <span v-else @click.stop="agreementPopupVisible = false">
        {{ $t('other.other_1019') }}
      </span>
    </div>
  </van-popup>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  // import { replaceXss } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpViewRestrictionWap',
    props: {
      value: {
        type: Boolean,
        required: true,
        default() {
          return false;
        }
      },
      agreement: {
        type: Object,
        required: true,
        default() {
          return {};
        }
      }
    },
    data() {
      return {
        agreementPopupVisible: false // 协议弹窗的显示
      };
    },
    watch: {
      value(val) {
        if (val) {
          this.agreementPopupVisible = true;
        }
      }
    },
    beforeCreate() {
      this.roomServer = useRoomBaseServer();
    },
    // created() {
    //   this.roomServer.$on('POPUP_AGREEMENT', this.handlePopupMsg);
    //   // this.roomServer.getAgreementStatus();
    // },
    // destroyed() {
    //   this.roomServer.$off('POPUP_AGREEMENT', this.handlePopupMsg);
    // },
    methods: {
      // server监听
      // handlePopupMsg(payload) {
      //   this.agreementInfo = payload;
      //   this.agreementInfo.content = replaceXss(this.agreementInfo.content); // 与简介相同的xss处理
      //   this.agreementPopupVisible = true;
      // },
      agree() {
        // this.roomServer.agreeWitthTerms();
        // this.agreementPopupVisible = false;
        this.close();
        this.$emit('agree');
      },
      disagree() {
        this.$emit('disagree');
        // this.roomServer.refusesTerms();
        // this.agreementPopupVisible = false;
        this.close();
      },
      close() {
        this.$emit('input', false);
        this.agreementPopupVisible = false;
      }
    }
  };
</script>
<style lang="less">
  .vmp-view-restriction-wap-overlay {
    // background: #fff;
  }
  .vmp-view-restriction-wap {
    width: 670px;
    height: 760px;
    background: #fff;
    box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 32px;
    padding: 60px 0 56px 56px;
  }

  .restriction-title {
    font-size: 36px;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 50px;
    word-break: break-all;
    word-wrap: break-word;
    padding-right: 56px;
    margin-bottom: 40px;
  }
  .scroll-content {
    max-height: 325px;
    margin-bottom: 29px;
    overflow-y: auto;
    word-break: break-all;
    word-wrap: break-word;
    padding-right: 56px;
    &.more-content {
      max-height: 400px;
    }
  }
  .restriction-content {
    width: 100%;
    font-size: 28px;
    color: #1a1a1a;
    line-height: 40px;
    img {
      display: block;
      object-fit: scale-down;
      margin: 10px 0px;
      max-width: 100%;
    }
  }
  .restriction-law {
    font-size: 28px;
    line-height: 40px;
    color: #666666;
    line-height: 40px;
    word-break: break-all;
    word-wrap: break-word;
    margin-top: 16px;
    .law-link {
      color: #3562fa;
      &:hover {
        cursor: pointer;
      }
    }
  }
  .restriction-control {
    width: 100%;
    min-height: 40px;
    position: absolute;
    bottom: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 6px;
    &.more-btn {
      padding-bottom: 20px;
    }
    text-align: center;
    & > span {
      display: inline-block;
      width: 320px;
      height: 90px;
      background: #fb2626;
      border-radius: 50px;
      border: none;
      font-weight: 400;
      color: #ffffff;
      line-height: 90px;
      font-size: 32px;
      &:hover {
        cursor: pointer;
      }
    }
    & > span:nth-child(2) {
      background: #fff;
      color: #1a1a1a;
      &:hover {
        color: #fb3a32;
      }
    }
  }
  .force-agree {
    background: rgba(0, 0, 0, 1);
  }
</style>
