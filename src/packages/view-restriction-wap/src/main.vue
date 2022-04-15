<template>
  <van-popup
    v-model="agreementPopupVisible"
    :closeable="agreementInfo.rule === 1"
    :class="['vmp-view-restriction-wap']"
    get-container="body"
  >
    <!-- 标题 -->
    <div class="restriction-title">
      {{ agreementInfo.title }}
    </div>
    <!-- 内容 -->
    <div
      :class="['restriction-content', { 'more-content': agreementInfo.rule === 1 }]"
      v-html="agreementInfo.content"
    ></div>
    <!-- 声明协议 -->
    <div
      v-if="agreementInfo.statement_content"
      class="restriction-law"
      v-html="agreementInfo.statement_content"
    ></div>
    <div class="restriction-control">
      <template v-if="!agreementInfo.rule">
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
  import { replaceXss } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpViewRestrictionWap',
    data() {
      return {
        agreementPopupVisible: false, // 协议弹窗的显示
        agreementInfo: {
          // 协议信息
          title: '',
          content: '',
          rule: 0, //协议规则 0:同意后进入 1:阅读后进入(每次进入直播间都弹出)
          statement_content: '' // 协议声明
        }
      };
    },
    beforeCreate() {
      this.roomServer = useRoomBaseServer();
    },
    created() {
      this.roomServer.$on('POPUP_AGREEMENT', this.handlePopupMsg);
      this.roomServer.getAgreementStatus();
    },
    destroyed() {
      this.roomServer.$off('POPUP_AGREEMENT', this.handlePopupMsg);
    },
    methods: {
      // server监听
      handlePopupMsg(payload) {
        this.agreementInfo = payload;
        this.agreementInfo.content = replaceXss(this.agreementInfo.content); // 与简介相同的xss处理
        this.agreementPopupVisible = true;
      },
      agree() {
        this.roomServer.agreeWitthTerms();
        this.agreementPopupVisible = false;
      },
      disagree() {
        this.roomServer.refusesTerms();
        this.agreementPopupVisible = false;
      }
    }
  };
</script>
<style lang="less">
  .vmp-view-restriction-wap {
    width: 670px;
    height: 760px;
    background: #fff;
    box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 32px;
    padding: 60px 56px 32px;
  }

  .restriction-title {
    font-size: 36px;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 50px;
  }
  .restriction-content {
    width: 100%;
    max-height: 350px;
    margin-bottom: 10px;
    overflow-y: auto;
    font-size: 28px;
    color: #1a1a1a;
    line-height: 40px;
    img {
      display: block;
      object-fit: scale-down;
      margin: 10px 0px;
    }
  }
  .more-content {
    max-height: 188px;
  }
  .restriction-law {
    font-size: 28px;
    line-height: 40px;
    color: #666666;
    line-height: 40px;
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
    padding-bottom: 24px;
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
      margin-top: 10px;
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
