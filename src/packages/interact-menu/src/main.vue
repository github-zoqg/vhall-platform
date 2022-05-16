<template>
  <div
    class="vmp-interact-menu"
    :class="[className, disable ? 'disable' : '']"
    :style="{ display: hidden ? 'none' : 'flex' }"
  >
    <div class="vmp-interact-menu-icon">
      <i class="vh-saas-iconfont vh-saas-a-line-Interactivetools"></i>
      <p>互动工具</p>
    </div>
    <div class="vmp-interact-menu-wrap" v-if="!disable">
      <div class="vmp-interact-menu-list">
        <div
          class="vmp-interact-menu-list-item"
          @click="openLottery"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          v-if="configList['ui.hide_lottery']"
        >
          <i class="vh-iconfont vh-a-line-luckydraw"></i>
          <p>抽奖</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openSign"
          v-if="configList['ui.hide_sign_in']"
        >
          <i class="vh-iconfont vh-line-order"></i>
          <p>签到</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          @click="emitOpenQuestionnaire"
          v-if="configList['ui.hide_survey']"
        >
          <i class="vh-iconfont vh-line-questionnaire"></i>
          <p>问卷</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="handleQAPopup"
          v-if="configList['ui.is_hide_qa_button']"
        >
          <i class="vh-iconfont vh-a-line-qanda"></i>
          <p>问答</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openRedPacket"
          v-if="configList['ui.show_redpacket']"
        >
          <i class="vh-iconfont vh-a-line-redpacket"></i>
          <p>红包</p>
          <!-- <vmp-air-container cuid="" :oneself="true"></vmp-air-container> -->
        </div>
        <div
          class="vmp-interact-menu-list-item"
          @click="openTimer"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          v-if="configList['webinar.timer']"
        >
          <i class="vh-iconfont vh-line-time"></i>
          <p>计时器</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openRebroadcast"
          v-if="!isNoDelay && configList['rebroadcast']"
        >
          <i class="vh-saas-iconfont vh-saas-a-color-Playbackmanagement"></i>
          <p>转播</p>
        </div>
      </div>
    </div>
    <!-- 问答 -->
    <el-dialog title="问答" :visible.sync="qaVisible" width="400px" class="qa_modal">
      <div class="qa_content" v-if="qaVisible">
        <template v-if="!assistantType">
          <div v-if="!isQAEnabled">
            <p class="qa_content_txt">
              1、开启后，右侧互动区会增加“问答”模块，可进入右下角“问答管理”对观众提问进行处理。
            </p>
            <p class="qa_content_txt">
              2、支持修改「问答」的显示名称，如改成「提问」「投票」等，修改后的名称在用户观看时生效。
            </p>
            <el-form inline>
              <el-form-item label="显示名称" class="qa_name_item">
                <el-input
                  class="form-input qa_name"
                  maxlength="8"
                  show-word-limit
                  v-model="QAName"
                ></el-input>
              </el-form-item>
            </el-form>
          </div>
          <p class="qa_content_txt" v-if="isQAEnabled">
            该功能已开启，是否关闭？ 当前已收集问题：{{ qaCount }} 个
          </p>
        </template>
        <template v-else>
          <p class="qa_content_txt" v-if="!isQAEnabled">
            点击后打开“问答管理”页面，观众端显示“问答”。
          </p>
          <p class="qa_content_txt" v-if="isQAEnabled">
            问答关闭后，观众端将不能提问。 当前已收集问题：{{ qaCount }}
            个
          </p>
        </template>
      </div>
      <div class="enable_qa_btn" slot="footer">
        <el-button type="primary" round @click="handleQASubmit" v-if="qaVisible">
          {{ !isQAEnabled ? '开启' : '关闭' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
  import { debounce } from 'lodash';
  import { useQaServer, useRoomBaseServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpInteractMenu',
    data() {
      return {
        living: false,
        isQAEnabled: useRoomBaseServer().state.interactToolStatus.question_status,
        qaVisible: false,
        qaCount: 0,
        className: '', // 自定义样式
        kind: '', // 类型
        disable: false, // 是否禁用
        hidden: false, // 是否隐藏
        disTimer: false,
        assistantType: false, // TODO: 客户端嵌入字段，后续客户端嵌入做的时候，直接从domain中取
        QAName: '问答'
      };
    },
    computed: {
      //互动工具状态
      interactToolStatus() {
        const { interactToolStatus = {} } = this.$domainStore.state.roomBaseServer;
        return interactToolStatus;
      },
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      // 无延迟 Type:Boolean
      isNoDelay() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      this.QAName = this.interactToolStatus.question_name;
      this.listenEvents();
    },
    methods: {
      listenEvents() {
        const msgServer = useMsgServer();
        const qaServer = useQaServer();
        msgServer.$on('live_over', () => {
          this.isQAEnabled = false;
          this.qaVisible = false;
        });
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.isQAEnabled = true;
        });
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.isQAEnabled = false;
        });
        qaServer.$on(qaServer.Events.QA_SET, msg => {
          this.QAName = msg.name;
        });
      },
      handleQAPopup() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110061);
        if (!this.qaVisible && this.isQAEnabled) {
          useQaServer()
            .getCurrentPlayQuestionNum()
            .then(res => {
              if (res.code == 200) {
                this.qaCount = res.data.num;
              } else {
                this.$message.error(res.msg);
              }
            });
        }
        this.qaVisible = !this.qaVisible;
      },
      handleQASubmit() {
        if (this.isQAEnabled) {
          this.closeQA();
        } else {
          this.enableQA();
        }
      },
      enableQA: debounce(function (flag) {
        useQaServer()
          .qaEnable({ name: this.QAName })
          .then(res => {
            if (res.code == 200) {
              window.vhallReportForProduct?.report(110052);
              this.isQAEnabled = true;
              this.qaVisible = false;
              this.$message({
                message: '开启问答成功',
                type: 'success'
              });
            } else {
              this.$message({
                message: '开启问答失败',
                type: 'error'
              });
            }
            // window.$middleEventSdk?.event?.send(
            //   boxEventOpitons(this.cuid, 'emitHandleQa', [{ visible: true, type: 'v5' }])
            // );
          });
      }, 500),
      closeQA: debounce(function (flag) {
        useQaServer()
          .qaDisable()
          .then(res => {
            if (res.code == 200) {
              this.qaVisible = false;
              this.isQAEnabled = true;
              window.vhallReportForProduct?.report(110053);
              this.$message({
                message: '关闭问答成功',
                type: 'success'
              });
            } else {
              this.$message({
                message: '关闭问答失败',
                type: 'error'
              });
            }
            // window.$middleEventSdk?.event?.send(
            //   boxEventOpitons(this.cuid, 'emitHandleQa', [{ visible: false, type: 'v5' }])
            // );
          });
      }, 500),
      // 设置可用状态
      setDisableState(val) {
        this.disable = val;
      },
      // 设置显示隐藏状态
      setHiddenState(val) {
        this.hidden = val;
      },
      // 打开计时器设置弹框
      openTimer() {
        if (this.disTimer || !this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
      },
      //  打开转播
      openRebroadcast() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRebroadcast'));
      },
      // 更改禁用状态
      changeStatus(data, status) {
        // console.log(data, status, 'data, status');
        this[data] = status;
      },
      // 打开抽奖弹窗
      openLottery() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenLottery'));
      },
      // 打开问卷弹窗
      emitOpenQuestionnaire() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110060);
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenQuestionnaire'));
      },
      // 打开签到弹窗
      openSign() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenSign'));
      },
      // 打开红包弹窗
      openRedPacket() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-interact-menu {
    position: relative;
    justify-content: center;

    &-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      padding: 10px 0px;
      cursor: pointer;
      color: #ececec;
      i {
        user-select: none;
        display: block;
        width: 23px;
        height: 23px;
        margin: 0 auto;
        padding-bottom: 6px;
        font-size: 22px;
      }
      p {
        font-size: 12px;
      }
      &:hover {
        color: #fb3a32;
      }
    }
    &:hover {
      .vmp-interact-menu-wrap {
        display: block;
      }
    }
    &.disable {
      cursor: default;
      i,
      p {
        color: #777777;
      }
      .vmp-interact-menu {
        &-icon {
          cursor: default;
        }
      }

      &:hover {
        .vmp-interact-menu-wrap {
          display: none;
        }
      }
    }

    &-wrap {
      display: none;
      position: absolute;
      left: 58px;
      top: 0;
      width: 154px;
      background: #434343;
      z-index: 2;
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #2d2d2d;
      padding: 0 10px 20px 10px;
      z-index: 110;
    }
    &-list {
      display: flex;
      flex-wrap: wrap;
      &-item {
        flex-shrink: 0;
        width: 44px;
        margin-top: 20px;
        font-size: 12px;
        color: #ececec;
        text-align: center;
        cursor: pointer;
        i {
          display: block;
          margin: 0 auto;
          font-size: 16px;
          padding-bottom: 4px;
        }
        &:hover {
          color: #fb3a32;
        }
      }
      &-disable {
        pointer-events: none; // 不可点击
        i,
        p {
          color: #777777;
        }
        pointer-events: none;
      }
    }
  }
  .qa_modal {
    .el-dialog__body {
      min-height: 80px;
    }
    .qa_content {
      .qa_content_txt {
        padding-bottom: 10px;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        text-align: justify;
        color: #666666;
      }
      .qa_name_item {
        margin: 0;
        .qa_name {
          width: 250px;
        }
      }
    }
    .el-dialog__footer {
      padding-top: 0;
    }
    .enable_qa_btn {
      text-align: right;
    }
  }
</style>
