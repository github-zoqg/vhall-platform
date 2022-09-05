<template>
  <van-popup
    v-model="popupVisible"
    closeable
    :class="['vmp-view-restriction-wap']"
    get-container="body"
  >
    <div class="scroll-content">
      <!-- 标题 -->
      <div class="restriction-title">
        {{ agreementInfo.title }}
      </div>
      <!-- 内容 -->
      <div class="restriction-content" v-html="agreementInfo.content"></div>
      <!-- 声明协议 -->
      <div
        v-if="agreementInfo.statement_content"
        class="restriction-law"
        v-html="agreementInfo.statement_content"
      ></div>
    </div>
    <div class="restriction-control">
      <span @click.stop="agree">{{ $t('other.other_1017') }}</span>
    </div>
  </van-popup>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons, replaceWithRules } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpViewRestrictionWap',
    data() {
      return {
        popupVisible: false, // 协议弹窗的显示
        agreementInfo: {}
      };
    },
    beforeCreate() {
      this.roomServer = useRoomBaseServer();
    },
    created() {
      this.roomServer.$on('POPUP_AGREEMENT', this.handlePopupMsg);
    },
    destroyed() {
      this.roomServer.$off('POPUP_AGREEMENT', this.handlePopupMsg);
    },
    methods: {
      // server监听
      handlePopupMsg() {
        const failure = err => {
          console.log(err);
          this.$toast(err.msg);
        };
        this.roomServer
          .getAgreementStatus()
          .then(res => {
            if (res.code === 200) {
              const data = res.data;
              let statement_content = '';
              if (data.statement_status && Array.isArray(data.statement_info)) {
                statement_content = data.statement_content;
                const rules = [];
                data.statement_info.forEach(statement => {
                  const txtHtml = `<a class="law-link" href="${statement.link}">${statement.title}</a>`;
                  rules.push({
                    before: statement.title,
                    after: txtHtml
                  });
                });
                statement_content = replaceWithRules(statement_content, rules);
              }
              this.agreementInfo = {
                statement_content,
                rule: data.rule,
                title: data.title,
                content: data.content
              };
              this.popupVisible = true;
            } else {
              failure(res);
            }
          })
          .catch(err => {
            failure(err);
          });
      },
      // 同意观看协议
      agree() {
        const failure = err => {
          console.log(err);
          this.$toast(err.msg);
        };
        const { third_user_id = '', email = '' } = this.$route.query;
        const params = {
          third_user_id,
          email
        };
        this.roomServer
          .agreeWitthTerms(params)
          .then(res => {
            if (res.code === 200) {
              this.popupVisible = false;
              // 还要处理auth回调
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitAgreeWitthTerms')
              );
            } else {
              failure(res);
            }
          })
          .catch(err => {
            failure(err);
          });
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
    padding: 64px 0 48px;

    .van-popup__close-icon {
      font-size: 32px;
      color: #8c8c8c;
    }

    ::-webkit-scrollbar {
      width: 12px;
    }
    ::-webkit-scrollbar-thumb {
      //滚动条的设置
      background-color: #ccc;
      background-clip: padding-box;
      border-radius: 6px;
    }
  }

  .restriction-title {
    font-size: 36px;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 40px;
    text-align: center;
  }
  .scroll-content {
    max-height: 540px;
    margin-bottom: 24px;
    overflow-y: auto;
    padding: 0 56px;
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
    bottom: 48px;
    left: 0px;
    text-align: center;
    & > span {
      display: inline-block;
      width: 320px;
      height: 90px;
      background: var(--theme-component-subscribe);
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
