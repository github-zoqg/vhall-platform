<template>
  <div class="vmp-stream-local">
    <section class="vmp-stream-local__shadow-box">
      <p class="vmp-stream-local__shadow-first-line">
        <el-tooltip :content="videoStatus ? '打开摄像头' : '关闭摄像头'" placement="top">
          <span
            class="vmp-stream-local__shadow-icon"
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
            class="vmp-stream-local__shadow-icon"
            @click="muteDevice('audio')"
            :class="audioStatus ? 'iconfont iconicon_maikefengguanbi' : 'iconfont iconyinliang'"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="top">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_xiamai"
            @click="speakOff()"
            v-if="roleName != 1 && role != 20"
          ></span>
        </el-tooltip>
      </p>
      <p class="vmp-stream-local__shadow-second-line">
        <el-tooltip content="切换" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_qiehuan"
            v-if="!isFullScreen"
            @click="exchange()"
          ></span>
        </el-tooltip>
        <el-tooltip content="全屏" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont"
            :class="{ iconicon_quanping: !isFullScreen, iconicon_quxiaoquanping: isFullScreen }"
            @click="fullScreen"
          ></span>
        </el-tooltip>
        <el-tooltip content="下麦" placement="bottom">
          <span
            class="vmp-stream-local__shadow-icon iconfont iconicon_xiamai"
            v-if="roleName != 1"
            @click="speakOff()"
          ></span>
        </el-tooltip>
      </p>
    </section>
  </div>
</template>

<script>
  export default {
    name: 'VmpStreamLocal',
    data() {
      return {
        videoStatus: false,
        audioStatus: false,
        isFullScreen: false,
        roleName: '',
        role: ''
      };
    },
    methods: {
      muteDevice() {},
      speakOff() {},
      exchange() {},
      fullScreen() {}
    }
  };
</script>

<style lang="less">
  .vmp-stream-local {
    width: 100%;
    height: 100%;
    background-color: #fff;
    position: relative;
  }
  // 遮罩层样式
  .vmp-stream-local__shadow-box {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .vmp-stream-local__shadow-first-line {
      line-height: 36px;
    }
    .vmp-stream-local__shadow-second-line {
      line-height: 36px;
    }
    .vmp-stream-local__shadow-icon {
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
