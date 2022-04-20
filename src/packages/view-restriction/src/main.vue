<template>
  <div v-if="popupVisible" class="vmp-view-restriction" ref="mask">
    <div class="vmp-view-restriction-wrap">
      <div class="restriction-title">
        {{ agreementInfo.title }}
      </div>
      <div class="restriction-content more-content" v-html="agreementInfo.content"></div>
      <div
        v-if="agreementInfo.statement_content"
        class="restriction-law"
        v-html="agreementInfo.statement_content"
      ></div>
      <div class="restriction-control">
        <span @click.stop="agree">{{ $t('other.other_1017') }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';

  export default {
    name: 'VmpViewRestriction',
    data() {
      return {
        popupVisible: false, // 协议弹窗的显示
        agreementInfo: {
          // 协议信息
          title: '',
          content: '',
          rule: 0, //协议规则 0:同意后进入 1:阅读后进入(每次进入直播间都弹出)
          statement_content: '', // 协议声明
          statement_status: 0
        }
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
    watch: {
      popupVisible: async function (val) {
        if (val) {
          await this.initEvent();
        }
      }
    },
    methods: {
      // server监听
      handlePopupMsg() {
        const failure = err => {
          console.log(err);
          this.$message({
            message: this.$tec(err.code) || err.msg,
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
        };

        this.roomServer
          .getAgreementStatus()
          .then(res => {
            if (res.code === 200) {
              const data = res.data;
              let statement_content = '';
              if (data.statement_status && Array.isArray(data.statement_info)) {
                statement_content = data.statement_content;
                data.statement_info.forEach(statement => {
                  const txtHtml = `<a class="law-link" href="${statement.link}">${statement.title}</a>`;
                  statement_content = statement_content.replace(statement.title, txtHtml);
                });
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
          this.$message({
            message: this.$tec(err.code) || err.msg,
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
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
      },
      async initEvent() {
        await this.$nextTick();
        const dom = this.$refs.mask;
        if (dom) {
          dom.addEventListener('onscroll', function (e) {
            e.preventDefault();
          });
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-view-restriction {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0px;
    left: 0px;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    font-family: PingFangSC-Medium, PingFang SC;
  }
  .vmp-view-restriction-wrap {
    width: 600px;
    height: 360px;
    background: #ffffff;
    box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 24px 32px 0px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .restriction-title {
      width: 100%;
      min-height: 28px;
      font-size: 20px;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 28px;
      margin-bottom: 24px;
    }
    .restriction-content {
      width: 100%;
      height: auto;
      max-height: 120px;
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 20px;
      overflow-y: scroll;
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
      width: 100%;
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      line-height: 20px;
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
      & > span {
        display: inline-block;
        width: 152px;
        height: 40px;
        text-align: center;
        background: #fb3a32;
        border-radius: 20px;
        border: none;
        font-weight: 400;
        color: #ffffff;
        line-height: 40px;
        font-size: 14px;
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
  }
  .force-agree {
    background: rgba(0, 0, 0, 1);
  }
</style>
