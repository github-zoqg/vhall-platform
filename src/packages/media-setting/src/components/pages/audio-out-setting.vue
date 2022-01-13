<template>
  <section>
    <aside>
      <audio ref="outputAudioPlayer" id="outputAudioPlayer" loop>
        <source src="@/packages/app-shared/assets/audio/audio.mp3" type="audio/mp3" />
        This browser does not support the audio element.
      </audio>
    </aside>

    <main>
      <section class="vmp-media-setting-item">
        <el-select
          class="vmp-media-setting-item__content"
          v-model="selectedId"
          @change="audioOutputChange"
        >
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>
      <section class="vmp-media-seting-item">
        <section class="vmp-media-setting-item__content">
          <div class="vmp-media-setting-playAudio-btn" @click="playAudio()">
            <img v-if="isPaused" src="@/packages/app-shared/assets/img/media_play.gif" />
            <img v-else src="@/packages/app-shared/assets/img/media_pause.gif" />
          </div>

          <div class="vmp-media-setting-voice-slider">
            <el-slider
              v-model="volume"
              :show-tooltip="false"
              :min="0"
              :max="1"
              :step="0.1"
            ></el-slider>
          </div>
        </section>
      </section>
    </main>
    <footer>
      <section>点击播放键，听不到声音？试试以下方法：</section>
      <p>1. 请允许浏览器使用声音权限</p>
      <p>2. 请调高设备的扬声器音量</p>
      <p>3. 选择外置扬声器或者更换电脑</p>
    </footer>
  </section>
</template>

<script>
  import { debounce } from 'lodash';

  export default {
    props: {
      devices: {
        type: Array,
        default: () => []
      },
      selectedId: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        isSafari: navigator.userAgent.match(/Version\/([\d.]+).*Safari/),
        speakerReady: false,
        isPaused: true,
        volume: 0.5
      };
    },
    watch: {
      volume(value) {
        if (!this.$refs.outputAudioPlayer) return;
        this.$refs.outputAudioPlayer.volume = value;
      }
    },
    mounted() {
      this.listenEvents();
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
      playAudio: debounce(function () {
        if (!this.$refs.outputAudioPlayer) return;
        if (!this.isPaused) return this.$refs.outputAudioPlayer.pause();
        if (!this.selectedId && !this.isSafari) return this.$message.warning('无可用的扬声器');
        this.$refs.outputAudioPlayer.play();
        this.speakerReady = true;
      }, 500),
      audioOutputChange(selectedId) {
        this.$emit('update:selectedId', selectedId);

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
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-playAudio-btn {
    display: flex;
    justify-content: center;
  }

  .vmp-media-setting-voice-slider {
    @theme-color: #fb3a32;
    .el-slider__bar {
      background-color: @theme-color;
    }

    .el-slider__button {
      width: 17px;
      height: 17px;
      border: none;
      background-color: @theme-color;
      box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
    }
  }
</style>
