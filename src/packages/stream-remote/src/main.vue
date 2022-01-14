<template>
  <div class="vmp-stream-remote">
    <!-- 流容器 -->
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>
    <!-- 底部流信息 -->
    <section class="vmp-stream-local__bootom">
      <span class="vmp-stream-local__bootom-nickname">{{ joinInfo.nickname }}</span>
      <span
        class="vmp-stream-local__bootom-signal"
        :class="`vmp-stream-local__bootom-signal__${networkStatus}`"
      ></span>
      <span
        class="vmp-stream-local__bootom-mic iconfont"
        :class="`iconicon_maikefeng_${micLevel}`"
      ></span>
    </section>
    <!-- 鼠标 hover 遮罩层 -->
    <section class="vmp-stream-remote__shadow-box">
      <p class="vmp-stream-remote__shadow-first-line">
        <el-tooltip :content="videoStatus ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-remote__shadow-icon"
            @click="muteDevice('video')"
            :class="
              videoStatus
                ? 'iconfont iconicon_shexiangtouguanbi'
                : 'iconfont iconicon_shexiangtoukaiqi'
            "
          ></span>
        </el-tooltip>
        <el-tooltip :content="audioStatus ? '打开麦克风' : '关闭麦克风'" placement="top">
          <span
            class="vmp-stream-remote__shadow-icon"
            @click="muteDevice('audio')"
            :class="audioStatus ? 'iconfont iconicon_maikefengguanbi' : 'iconfont iconyinliang'"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon iconfont iconicon_xiamai"
            @click="speakOff"
            v-if="roleName != 1 && role != 20"
          ></span>
        </el-tooltip>
      </p>
      <p class="vmp-stream-remote__shadow-second-line">
        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon iconfont iconicon_qiehuan"
            v-if="!isFullScreen"
            @click="exchange"
          ></span>
        </el-tooltip>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon iconfont"
            :class="{ iconicon_quanping: !isFullScreen, iconicon_quxiaoquanping: isFullScreen }"
            @click="fullScreen"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-remote__shadow-icon iconfont iconicon_xiamai"
            v-if="roleName != 1"
            @click="speakOff"
          ></span>
        </el-tooltip>
      </p>
    </section>
  </div>
</template>

<script>
  import { useInteractiveServer } from 'middle-domain';
  export default {
    name: 'VmpStreamRemote',
    data() {
      return {
        micLevel: 1,
        networkStatus: 0
      };
    },
    props: {
      stream: {
        require: true
      }
    },
    computed: {
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      }
    },
    filters: {
      roleNameFilter(roleName) {
        const roleNameMap = {
          1: '主持人',
          2: '观众',
          3: '助理',
          4: '嘉宾',
          20: '组长'
        };
        return roleNameMap[roleName];
      }
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
    },
    mounted() {
      this.subscribeRemoteStream();
    },
    methods: {
      subscribeRemoteStream() {
        // TODO:主屏订阅大流，小窗订阅小流
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode: `stream-${this.stream.streamId}` // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };
        this.interactiveServer
          .subscribe(opt)
          .then(e => {
            console.log('订阅成功----', e);
            // 保证订阅成功后，正确展示画面   有的是订阅成功后在暂停状态显示为黑画面
            setTimeout(() => {
              const list = document.getElementsByTagName('video');
              for (const item of list) {
                item.play();
              }
            }, 2000);
          })
          .catch(e => {
            console.log('订阅失败----', e); // object 类型， { code:错误码, message:"", data:{} }
          });
      },
      muteDevice() {},
      speakOff() {},
      fullScreen() {},
      exchange() {
        if (this.$listeners.exchange) {
          this.$emit('exchange', this.index);
          return false;
        }
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickExchange'
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-stream-remote {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
    &:hover {
      .vmp-stream-remote__shadow-box {
        display: flex;
      }
    }
    .vmp-stream-remote__container {
      width: 100%;
      height: 100%;
    }
    .vmp-stream-local__bootom {
      width: 100%;
      height: 24px;
      font-size: 12px;
      line-height: 24px;
      color: #ffffff;
      box-sizing: border-box;
      padding: 0 6px;
      position: absolute;
      bottom: 0;
      background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.85));
      &-nickname {
        display: inline-block;
        width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &-mic {
        float: right;
        font-size: 12px;
      }
      &-signal {
        float: right;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 4px;
        background-size: contain;
        height: 16px;
        width: 16px;
        background-image: url(./images/network0.png);
        &-0 {
          background-image: url(./images/network0.png);
        }
        &-1 {
          background-image: url(./images/network1.png);
        }
        &-2 {
          background-image: url(./images/network2.png);
        }
      }
    }
    // 遮罩层样式
    .vmp-stream-remote__shadow-box {
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .vmp-stream-remote__shadow-first-line {
        line-height: 36px;
      }
      .vmp-stream-remote__shadow-second-line {
        line-height: 36px;
      }
      .vmp-stream-remote__shadow-icon {
        cursor: pointer;
        text-align: center;
        display: inline-block;
        color: #fff;
        font-size: 16px;
        width: 28px;
        height: 28px;
        line-height: 28px;
        background: hsla(0, 0%, 100%, 0.3);
        border-radius: 100%;
        margin-right: 10px;
        &:last-child {
          margin-right: 0;
        }
      }
    }
  }
</style>
