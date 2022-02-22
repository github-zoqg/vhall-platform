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
    <div class="vmp-interact-menu-wrap">
      <div class="vmp-interact-menu-list">
        <div
          class="vmp-interact-menu-list-item"
          @click="openLottery"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
        >
          <i class="vh-iconfont vh-a-line-luckydraw"></i>
          <p>抽奖</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openSign"
        >
          <i class="vh-iconfont vh-line-order"></i>
          <p>签到</p>
        </div>
        <div class="vmp-interact-menu-list-item">
          <i class="vh-iconfont vh-line-questionnaire"></i>
          <p>问卷</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
        >
          <i class="vh-iconfont vh-a-line-qanda"></i>
          <p>问答</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
        >
          <i class="vh-iconfont vh-a-redpacket"></i>
          <p>红包</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          @click="openTimer"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
        >
          <i class="vh-iconfont vh-line-time"></i>
          <p>计时器</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
        >
          <i class="vh-saas-iconfont vh-saas-a-color-Playbackmanagement"></i>
          <p>转播</p>
        </div>
      </div>
    </div>
    <!-- 问答 -->
    <saas-alert
      title="问答"
      :retry="isQAEnabled ? '关闭问答' : '开启问答'"
      :visible="qaVisible"
      @onClose="qaVisible = false"
      @onSubmit="handleQASubmit"
    >
      <div slot="content">
        <template v-if="!assistantType">
          <p v-if="!isQAEnabled">
            开启后，右侧互动区会增加“问答”模块，可进入右下角“问答管理”对观众提问进行处理。
          </p>
          <p v-if="isQAEnabled">该功能已开启，是否关闭？ 当前已收集问题：{{ qaCount }} 个</p>
        </template>
        <template v-else>
          <p v-if="!isQAEnabled">点击后打开“问答管理”页面，观众端显示“问答”。</p>
          <p v-if="isQAEnabled">
            问答关闭后，观众端将不能提问。 当前已收集问题：{{ qaCount }}
            个
          </p>
        </template>
      </div>
    </saas-alert>
  </div>
</template>
<script>
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  import { debounce } from 'lodash';
  import { useQaServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  const qaServer = useQaServer();
  export default {
    name: 'VmpInteractMenu',
    components: {
      SaasAlert
    },
    data() {
      return {
        living: false,
        isQAEnabled: false,
        qaVisible: false,
        qaCount: 0,
        className: '', // 自定义样式
        kind: '', // 类型
        disable: false, // 是否禁用
        hidden: false, // 是否隐藏
        disTimer: false,
        assistantType: false // TODO: 客户端嵌入字段，后续客户端嵌入做的时候，直接从domain中取
      };
    },
    computed: {
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      }
    },
    methods: {
      handleQAPopup() {
        if (!this.qaVisible && this.isQAEnabled) {
          qaServer.getCurrentPlayQuestionNum().then(res => {
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
      enableQA: debounce(flag => {
        console.log(qaServer);
        qaServer.qaEnable().then(res => {
          console.log('开启问答', res);
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
        if (this.disTimer) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
      },
      // 更改禁用状态
      changeStatus(data, status) {
        // console.log(data, status, 'data, status');
        this[data] = status;
      },
      // 打开抽奖弹窗
      openLottery() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenLottery'));
      },
      // 打开签到弹窗
      openSign() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenSign'));
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
        color: #fc5659;
      }
    }

    &.disable {
      i,
      p {
        color: #777777;
      }
    }
    &:hover {
      .vmp-interact-menu-wrap {
        display: block;
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
          color: #fc5659;
        }
      }
      &-disable {
        i,
        p {
          color: #777777;
        }
      }
    }
  }
</style>
