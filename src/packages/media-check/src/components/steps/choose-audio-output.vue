<template>
  <section class="vh-media-check-audiooutput">
    <main>
      <!-- 选择音频输出设备(扬声器) -->
      <div class="vh-media-check-selector">
        <label>扬声器</label>
        <el-select v-model="selectedId" v-if="devices.length != 0" @change="audioOutputChange">
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
        <el-select value="" v-if="devices.length == 0" disabled>
          <el-option key="" value="" :label="$t('setting.setting_1033')"></el-option>
        </el-select>
      </div>

      <!-- 播放试听音频 -->
      <section>
        <audio ref="outputAudioPlayer" id="outputAudioPlayer" loop>
          <source src="../../assets/audio.mp3" type="audio/mp3" />
          This browser does not support the audio element.
        </audio>

        <div class="play-button" @click="playAudio()">
          <img v-if="isPaused" src="../../assets/media_play.gif" />
          <img v-else src="../../assets/media_pause.gif" />
        </div>
        <p class="play-button__desc">点此播放声音</p>
        <div class="vh-check-box volume-slider-box">
          <el-slider
            v-model="volume"
            :show-tooltip="false"
            :min="0"
            :max="1"
            :step="0.1"
          ></el-slider>
        </div>
      </section>
    </main>

    <footer class="vh-media-check-footer">
      <div class="vh-check-tip audio-preview">
        <span class="vh-iconfont vh-line-voice icon-tip"></span>
        <span>点击播放键，您能听到声音么？</span>
      </div>
      <div class="button-container button-container__audio">
        <el-button
          round
          class="confirm"
          type="primary"
          :disabled="!speakerReady"
          :class="{ disable: !speakerReady }"
          @click="success"
        >
          能听到
        </el-button>
        <el-button
          round
          class="cancel"
          :class="{ disable: !speakerReady }"
          :disabled="!speakerReady"
          @click="fail"
        >
          听不到
        </el-button>
      </div>
    </footer>
  </section>
</template>

<script>
  import { debounce } from 'lodash';

  export default {
    props: {
      defaultSelected: {
        type: String,
        default: ''
      },
      devices: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        isSafari: navigator.userAgent.match(/Version\/([\d.]+).*Safari/),

        selectedId: '',
        volume: 0.5,
        isPaused: true,
        speakerReady: false
      };
    },
    watch: {
      volume(value) {
        this.$refs.outputAudioPlayer && (this.$refs.outputAudioPlayer.volume = value);
      },
      defaultSelected(cur) {
        this.setSelectedId(cur);
      }
    },
    mounted() {
      this.listenEvents();
      this.setSelectedId(this.defaultSelected);
    },
    beforeDestroy() {
      this.removeEvents();
    },
    methods: {
      listenEvents() {
        this.setisPaused = () => (this.isPaused = true);
        this.setAudioPlay = () => (this.isPaused = false);

        this.$refs.outputAudioPlayer.addEventListener('pause', this.setisPaused);
        this.$refs.outputAudioPlayer.addEventListener('play', this.setAudioPlay);
      },
      removeEvents() {
        this.$refs.outputAudioPlayer.removeEventListener('pause', this.setisPaused);
        this.$refs.outputAudioPlayer.removeEventListener('play', this.setAudioPlay);
      },
      setSelectedId(id) {
        this.selectedId = id;
        this.audioOutputChange();
      },
      /**
       * 更改选中的音频设备
       */
      audioOutputChange() {
        const audioPlayer = this.$refs.outputAudioPlayer;
        if (!audioPlayer) return;

        if (typeof audioPlayer.sinkId === 'undefined') {
          console.warn('Browser does not support output device selection.');
        } else {
          audioPlayer
            .setSinkId(this.selectedId)
            .then(() => {})
            .catch(error => {
              let errorMessage = error;
              if (error.name === 'SecurityError') {
                errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
              }
              console.error(errorMessage);
            });
        }
      },
      /**
       * 播放测试音频
       * @notice debounce,200毫秒延迟
       */
      playAudio: debounce(function () {
        if (!this.$refs.outputAudioPlayer) return;
        if (!this.isPaused) return this.$refs.outputAudioPlayer.pause();
        if (!this.selectedId && !this.isSafari) return this.$message.warning('无可用的扬声器');
        this.$refs.outputAudioPlayer.play();
        this.speakerReady = true;
      }, 500),
      success() {
        window?.vhallReportForProduct?.report(110008, {
          report_extra: { dn: this.selectedId }
        }); // 埋点 - 扬声器设备检测成功

        this.$emit('next', { result: 'success', val: this.selectedId });
      },
      fail() {
        window?.vhallReportForProduct?.report(110012, {
          report_extra: { dn: this.selectedId }
        }); // 埋点 - 扬声器设备检测失败

        this.$emit('next', { result: 'fail' });
      }
    }
  };
</script>

<style lang="less">
  .vh-media-check-audiooutput {
    width: 296px;
    margin: 0 auto;

    // selector
    .vh-media-check-selector {
      display: flex;
      align-items: center;

      label {
        flex: 0;
        min-width: 44px;
        font-size: 12px;
        color: #1a1a1a;
      }
      .el-select {
        flex: 1;
      }
    }

    .play-button {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      img {
        width: 76px;
        cursor: pointer;
      }

      &__desc {
        text-align: center;
      }
    }

    // footer
    .vh-media-check-footer {
      margin-top: 40px;
      margin-bottom: 30px;

      // tip
      .vh-check-tip {
        text-align: center;
        color: #1a1a1a;
        display: flex;
        justify-content: center;
        align-items: center;
        & > .iconfont {
          font-size: 20px;
        }
        .icon-tip {
          color: #fb3a32;
          padding-right: 7px;
        }
      }

      // button-container
      .button-container {
        text-align: right;
        margin-top: 64px;
        position: absolute;
        bottom: 4px;
        right: 32px;

        .el-button:last-child {
          margin-left: 12px;
        }
      }
    }
  }
</style>
