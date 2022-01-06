<template>
  <div class="vmp-stream-remote">
    <div class="vmp-stream-remote__container" :id="`stream-${stream.streamId}`"></div>
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
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpStreamRemote',
    data() {
      return {};
    },
    props: {
      stream: {
        require: true
      }
    },
    beforeCreate() {
      this.interactiveServer = contextServer.get('interactiveServer');
    },
    mounted() {
      this.subscribeRemoteStream();
    },
    methods: {
      subscribeRemoteStream() {
        const opt = {
          streamId: this.stream.streamId, // 远端流ID，必填
          videoNode: `stream-${this.stream.streamId}` // 远端流显示容器， 必填
          // dual: this.mainScreen == this.accountId ? 1 : 0 // 双流订阅选项， 0 为小流 ， 1 为大流  选填。 默认为 1
        };
        this.interactiveServer
          .subscribeStream(opt)
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
  }
  .vmp-stream-remote__container {
    width: 100%;
    height: 100%;
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
</style>
