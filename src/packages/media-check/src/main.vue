<template>
  <div>
    <el-dialog
      class="vh-media-check"
      :visible.sync="isShow"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      center
      top="15vh"
      @open="restart"
    >
      <!-- step导航条 -->
      <header v-if="currentStep !== STEP_OPTS.RESULT - firstStep">
        <el-steps :active="currentStep" :class="'audio'">
          <el-step
            v-for="item of checkList"
            :key="item.name"
            :class="`is-${item.status}`"
            :title="item.status === 'process' ? '检测中' : item.text"
          >
            <step-icon slot="icon" :item="item" />
          </el-step>
        </el-steps>
      </header>

      <!-- 主体部分 -->
      <main class="vh-media-check-main">
        <!-- 视频检测 -->
        <section v-if="currentStep === STEP_OPTS.VIDEO - firstStep">
          <choose-video
            :defaultSelected="selected.video"
            :devices="videoDevices"
            :server="mediaCheckServer"
            @next="next"
          />
        </section>

        <!-- 音频输入(话筒)检测 -->
        <section v-if="currentStep === STEP_OPTS.AUDIO_INPUT - firstStep">
          <choose-audio-input
            :defaultSelected="selected.audioInput"
            :devices="audioInputDevices"
            @next="next"
          />
        </section>

        <!-- 音频输出(扬声器)检测 -->
        <section v-if="currentStep === STEP_OPTS.AUDIO_OUTPUT - firstStep">
          <choose-audio-output
            :defaultSelected="selected.audioOutput"
            :devices="audioOutputDevices"
            @next="next"
          />
        </section>

        <!-- 结果页 -->
        <section v-if="currentStep === STEP_OPTS.RESULT - firstStep">
          <check-result :check-list="checkList" @next="next" />
        </section>
      </main>
    </el-dialog>

    <pre-dialog ref="pre-dialog" @show="showCheckDialog"></pre-dialog>
  </div>
</template>

<script>
  import StepIcon from './components/step-icon.vue';
  import PreDialog from './components/pre-dialog.vue';
  import ChooseVideo from './components/steps/choose-video.vue';
  import ChooseAudioInput from './components/steps/choose-audio-input.vue';
  import ChooseAudioOutput from './components/steps/choose-audio-output.vue';
  import CheckResult from './components/steps/check-result.vue';
  import { useMediaCheckServer, useRoomBaseServer } from 'middle-domain';

  import { STEP_OPTS } from './js/config';
  import { getCheckList } from './js/getCheckListEntity';

  import { setSession, getSession } from './js/setSession';

  export default {
    name: 'VmpPcMediaCheck',
    components: {
      PreDialog,
      StepIcon,
      ChooseVideo,
      ChooseAudioInput,
      ChooseAudioOutput,
      CheckResult
    },
    data() {
      return {
        liveMode: 0,
        isShow: false,

        // enum option 「枚举选项」
        STEP_OPTS: Object.freeze(STEP_OPTS),

        // 步骤控制和检查
        checkList: getCheckList(),
        currentStep: 0,
        firstStep: 0,

        // devices 设备列表
        videoDevices: [], // 视频设备列表
        audioInputDevices: [], // 音频输入(话筒)列表
        audioOutputDevices: [], // 音频输出(扬声器)列表
        selected: {
          video: '',
          audioInput: '',
          audioOutput: ''
        }
      };
    },
    beforeCreate() {
      this.mediaCheckServer = useMediaCheckServer();
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.liveMode = watchInitData?.webinar?.mode;
      this.getSessionSelectedDevice();
    },
    methods: {
      show() {
        this.$refs['pre-dialog'].show();
      },
      showCheckDialog() {
        this.isShow = true;
        this.restart();
      },
      getSessionSelectedDevice() {
        this.selected.video = getSession('selected.video');
        this.selected.audioInput = getSession('selected.audioInput');
        this.selected.audioOutput = getSession('selected.audioOutput');
      },
      setSessionSelectedDevice() {
        setSession('selected.video', this.selected.video);
        setSession('selected.audioInput', this.selected.audioInput);
        setSession('selected.audioOutput', this.selected.audioOutput);
      },
      async restart() {
        // reset-data
        this.checkList = getCheckList();
        if (this.liveMode === 1) {
          this.checkList = this.checkList.filter(el => el.name !== 'video');
          this.firstStep = 1;
        }
        this.currentStep = 0;

        this.checkList[0].status = 'process';

        this.videoDevices = [];
        this.audioInputDevices = [];
        this.audioOutputDevices = [];
        this.selected.video = '';
        this.selected.audioInput = '';
        this.selected.audioOutput = '';

        // TODO:layout===1 (audio type)

        try {
          await this.getVideoDeviceInfo();
        } catch (err) {
          this.$message.error(`获取摄像头失败，请检查是否被占用或被禁用`);
        }
      },
      next({ result }) {
        const step = this.currentStep;
        if (step === this.checkList.length) return this.finish({ result });

        this.checkList[step].status = result; // 记录当前步骤的结果（成功/失败）
        if (this.checkList[step + 1]) {
          this.checkList[step + 1].status = 'process'; // 设置下一个步骤进行中
        }

        this.currentStep++;
      },
      finish({ result }) {
        if (result === 'fail') {
          this.restart();
        } else {
          //TODO: EventBus.$emit('MEDIACHECK_FINISH')
          this.isShow = false;
        }
      },
      /**
       * 获取视频列表
       */
      async getVideoDeviceInfo() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(trackInput => trackInput.stop());
        this.getDevices();
      },
      async getDevices() {
        const devices = await this.mediaCheckServer.getDevices();

        // 获取视频列表
        this.videoDevices = devices.videoInputDevices.filter(
          item => item.label && item.deviceId !== 'desktopScreen'
        );
        if (this.videoDevices.length > 0) {
          this.selected.video = this.videoDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.video');
        }

        // 获取音频输入列表(话筒)
        this.audioInputDevices = devices.audioInputDevices.filter(
          d => d.deviceId !== 'default' && d.deviceId !== 'communications' && d.label
        );
        if (this.audioInputDevices.length > 0) {
          this.selected.audioInput = this.audioInputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.audioInput');
        }

        // 获取音频输出设备列表(扬声器)
        this.audioOutputDevices = devices.audioOutputDevices.filter(item => item.label);
        if (this.audioOutputDevices.length > 0) {
          this.selected.audioOutput = this.audioOutputDevices[0].deviceId;
        } else {
          sessionStorage.removeItem('media-check.selected.audioOutput');
        }
      }
    }
  };
</script>

<style lang="less">
  .vh-media-check {
    display: flex;

    .el-dialog__header {
      display: none;
    }

    .el-dialog {
      width: 460px;
      height: 520px;
      border-radius: 4px;
      margin: auto;
    }

    .el-dialog__body {
      height: 500px;
      padding: 50px 56px 0 56px !important;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      position: relative;
    }

    .el-steps {
      justify-content: space-between;

      &.audio {
        width: 296px;
        margin: 0 auto;
        & > .el-step {
          & > .el-step__head {
            & > .el-step__line {
              height: 1px;
              top: 19px;
              width: 180px;
              left: 38%;
              background: #e8e8e8;
              & > .el-step__line-inner {
                display: none;
              }
            }
          }
        }
      }

      & > .el-step {
        & > .el-step__head {
          &.is-process {
            .iconfont {
              color: #3562fa;
            }
          }
          &.is-no-check {
            .el-step__line {
              background-color: #cccccc;
            }
          }
          & > .el-step__line {
            height: 1px;
            top: 19px;
            width: 90px;
            left: 33%;
            background: #3562fa;
            & > .el-step__line-inner {
              display: none;
            }
          }
          & > .el-step__icon {
            border: none;
            height: 40px;
            width: 40px;
            background-color: #f5f5f5;
            color: white;
            line-height: 40px;
            & > .el-icon-check {
              font-size: 22px;
              font-weight: normal;
            }
            & > .el-icon-close {
              font-size: 22px;
              font-weight: normal;
            }
            & > .iconfont {
              font-size: 24px;
            }
          }
          &.is-no-check {
            & > .el-step__icon {
              background-color: #f5f5f5;
              color: #666666;
            }
          }
        }
        &.is-fail {
          & > .el-step__head {
            .el-step__icon {
              background-color: #fb3a32;
              .iconfont {
                font-size: 20px;
              }
            }
          }
        }
        &.is-success {
          & > .el-step__head {
            .el-step__icon {
              background-color: #3562fa;
              .iconfont {
                font-size: 20px;
              }
            }
          }
        }
      }
    }

    .el-step__title {
      font-size: 14px;
      line-height: 16px;
      padding-top: 3px;
      color: #666;
      &.is-process {
        color: #3562fa;
        font-weight: normal;
      }
      &.is-wait {
        color: #606266;
        font-weight: normal;
      }
      &.is-success {
        color: #606266;
        font-weight: normal;
      }
    }
    .el-step__description {
      margin-top: 0;
    }

    .vh-media-check-main {
      width: 296px;
      padding-top: 16px;
      margin: 0 auto;
    }
  }
</style>
