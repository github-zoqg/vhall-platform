<template>
  <div
    :class="[
      'lottery-winner-info',
      isEmbed ? 'lottery-winner-embed-info' : '',
      { big: stepHtmlList.length !== 3 }
    ]"
  >
    <lottery-header :prizeInfo="prizeInfo" />
    <el-form ref="forms" class="winner-info-form">
      <el-form-item v-for="(item, index) in stepHtmlList" :key="index" :required="true">
        <span v-if="item.is_required == 1" class="required-flag">*</span>
        <el-input
          v-if="item.field_key !== 'address'"
          v-model="reciveInfo[item.field_key]"
          :placeholder="$tdefault(item.placeholder)"
          maxlength="200"
          @keyup.native.stop="foo()"
          @input.native="handleInput(item.field_key)"
        ></el-input>
        <textarea
          v-else
          id="address-textarea"
          v-model="reciveInfo[item.field_key]"
          :placeholder="$tdefault(item.placeholder)"
          rows="2"
          class="address-textarea"
          maxlength="200"
          @keyup.stop="foo"
        ></textarea>
      </el-form-item>
    </el-form>
    <p class="winner-info-tip">{{ $t('interact_tools.interact_tools_1018') }}</p>
    <div class="winner-info__submit-btn" @click="postWinnerInfo">
      {{ $t('interact_tools.interact_tools_1019') }}
    </div>
    <i class="lottery__close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
  </div>
</template>

<script>
  /**
   * @description 领奖页面(大部分逻辑复用saas)
   */
  import OverlayScrollbars from 'overlayscrollbars';
  import LotteryHeader from './lottery-header';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'LotteryAccept',
    components: {
      LotteryHeader
    },
    inject: ['lotteryServer'],
    props: {
      lotteryId: {
        type: [String, Number],
        required: true
      },
      prizeInfo: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    computed: {
      isEmbed() {
        // 判断完全嵌入，解决签到在特殊高度下 无法完全展示签到弹窗问题
        const { embedObj } = this.roomBaseServer.state;
        return embedObj.embed && !embedObj.embedVideo;
      }
    },
    data() {
      return {
        stepHtmlList: [],
        reciveInfo: {},
        overlayScrollbar: null,
        osComponentOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          },
          overflowBehavior: {
            x: 'hidden'
          }
        }
      };
    },
    async created() {
      await this.initStepHtmlList();
      const retReciveInfo = {};
      this.stepHtmlList.forEach(element => {
        retReciveInfo[element.field_key] = '';
      });
      this.reciveInfo = retReciveInfo;
      // await this.$nextTick();
      // this.overlayScrollbarInit();
    },
    // mounted() {
    //   // 滚动条初始化
    // },
    methods: {
      async initStepHtmlList() {
        await this.lotteryServer.getDrawPrizeInfo().then(res => {
          this.stepHtmlList = res.data;
        });
      },
      handleInput(field) {
        if (field === 'phone') {
          this.reciveInfo.phone = this.reciveInfo.phone.replace(/[^\d]/g, '');
        }
      },
      // 空函数，阻止输入框空格按键事件冒泡，触发播放器暂停/播放
      foo() {},
      // 滚动条初始化
      overlayScrollbarInit() {
        this.$nextTick(() => {
          console.log(document.getElementById('address-textarea'));
          this.overlayScrollbar = OverlayScrollbars(document.getElementById('address-textarea'), {
            paddingAbsolute: true,
            className: 'os-theme-light os-theme-vhall',
            scrollbars: {
              autoHide: 'leave',
              autoHideDelay: 200
            }
          });
        });
      },
      close() {
        this.$emit('close');
      },
      // 表单校验
      validateWinnerInfo() {
        try {
          this.stepHtmlList.forEach(ele => {
            if (ele.is_required == 1) {
              if (
                this.reciveInfo[ele.field_key] == '' ||
                this.reciveInfo[ele.field_key].trim() == ''
              ) {
                throw ele.field;
              }
              if (ele.field_key == 'phone') {
                const phone = this.reciveInfo[ele.field_key].replace(/\s/g, '');
                const regs = /^1(3|4|5|6|7|8|9)\d{9}$/;
                if (!regs.test(phone)) {
                  throw '手机号格式错误'; // eslint-disable-line
                }
              }
            }
          });
        } catch (error) {
          this.$message({
            message:
              error == '手机号格式错误'
                ? this.$t('511016')
                : `${this.$t('message.message_1032')} ${this.$tec(error) || ''}`,
            showClose: true,
            type: 'error',
            customClass: 'zdy-info-box'
          });
          return false;
        }
        return true;
      },
      // 提交领奖人信息
      postWinnerInfo() {
        // 表单校验
        if (this.validateWinnerInfo()) {
          const lotteryUserRemark = [];
          this.stepHtmlList.forEach(ele => {
            if (ele.field_key != 'name' && ele.field_key != 'phone') {
              ele.field_value = this.reciveInfo[ele.field_key];
              lotteryUserRemark.push(ele);
            }
          });
          this.lotteryServer
            .acceptPrize({
              lottery_id: this.lotteryId,
              lottery_user_name: this.reciveInfo.name,
              lottery_user_phone: this.reciveInfo.phone,
              lottery_user_remark: JSON.stringify(lotteryUserRemark)
            })
            .then(res => {
              if (res.code === 200) {
                this.lotteryServer.$emit(this.lotteryServer.Events.LOTTERY_SUBMIT);
                this.$nextTick(() => {
                  this.$emit('navTo', 'LotterySuccess');
                });
              } else {
                this.$message({
                  message: res.msg,
                  showClose: true,
                  type: 'error',
                  customClass: 'zdy-info-box'
                });
              }
            })
            .catch(err => {
              this.$message({
                message: err.msg,
                showClose: true,
                type: 'error',
                customClass: 'zdy-info-box'
              });
            });
        }
      }
    }
  };
</script>
<style lang="less">
  .lottery-winner-info {
    .os-theme-vhall > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle {
      background-color: #cccccc;
    }
    .os-theme-vhall > .os-scrollbar-vertical {
      right: -10px;
    }
    .address-textarea > .os-scrollbar-vertical {
      right: 0;
    }
    .os-host-overflow {
      overflow: visible !important;
    }
    .lottery-header {
      margin-top: 68px;
    }
    .el-form-item {
      margin-bottom: 5px;
    }
    .winner-info-form {
      max-height: 156px;
      overflow-y: auto;
      overflow-x: hidden;
      .el-form-item__content {
        line-height: 0;
      }
      .el-form-item {
        margin-bottom: 8px;
        &::after {
          display: none;
        }
      }
      .el-input__inner {
        height: 36px;
        background: rgba(254, 239, 228, 0.9);
        border-radius: 4px;
        padding-left: 22px;
        border: none;
        &:hover {
          border: none;
        }
        &::-webkit-input-placeholder {
          color: #666666;
        }
        &::-moz-input-placeholder {
          color: #666666;
        }
        &::-ms-input-placeholder {
          color: #666666;
        }
      }
      .address-textarea {
        width: 235px;
        height: 44px;
        line-height: 20px;
        background: rgba(254, 239, 228, 0.9);
        border-radius: 4px;
        border-color: transparent;
      }
      #address-textarea {
        padding: 7px 0 7px 22px;
        &:focus-visible {
          outline: none;
        }
        &::-webkit-input-placeholder {
          color: #666666;
        }
        &::-moz-input-placeholder {
          color: #666666;
        }
        &::-ms-input-placeholder {
          color: #666666;
        }
      }
      .os-theme-vhall > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle {
        background-color: #cccccc;
      }
      .os-theme-vhall > .os-scrollbar-vertical {
        right: -10px;
      }
      .address-textarea > .os-scrollbar-vertical {
        right: 0;
      }
      .os-host-overflow {
        overflow: visible !important;
      }
    }
  }
</style>
<style lang="less" scoped>
  .lottery-winner-info {
    width: 424px;
    height: 463px;
    background: url(../img/bg-winner-info.png);
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .winner-info-form {
      width: 260px;
      // height: 150px;
      margin-top: 24px;
      .required-flag {
        position: absolute;
        color: #666666;
        left: 8px;
        top: 20px;
        z-index: 1;
      }
    }
    .winner-info-tip {
      font-size: 14px;
      color: #ffffff;
      line-height: 20px;
      margin-top: 0px;
      width: 260px;
    }
    .winner-info__submit-btn {
      width: 160px;
      height: 40px;
      border-radius: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #fb3a32;
      line-height: 40px;
      text-align: center;
      user-select: none;
      cursor: pointer;
      position: absolute;
      bottom: 46px;
      left: 50%;
      transform: translateX(-80px);
      font-size: 14px;
    }
    &.big {
      background: url(../img/bg-winner-info-big.png);
      height: 507px;
    }
  }
  @media screen and (max-height: 580px) {
    .lottery-winner-embed-info {
      margin-top: 0px;
    }
  }
</style>
