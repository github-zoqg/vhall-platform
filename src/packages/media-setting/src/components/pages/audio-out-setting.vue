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
          v-model="mediaState.audioOutput"
          :placeholder="$t('form.form_1018')"
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
        <section class="vmp-media-setting-item__content vmp-media-setting-item__content--column">
          <div class="vmp-media-setting-playAudio-btn" @click="playAudio()">
            <img v-if="isPaused" src="@/packages/app-shared/assets/img/media_play.gif" />
            <img v-else src="@/packages/app-shared/assets/img/media_pause.gif" />
          </div>
          <p class="vmp-media-setting-play-tips">{{ $t('setting.setting_1024') }}</p>

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
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">
          {{ $t('setting.setting_1025') }}
        </section>
        <section class="vmp-media-setting-tips__content">
          <p>1. {{ $t('setting.setting_1026') }}</p>
          <p>2. {{ $t('setting.setting_1027') }}</p>
          <p>3. {{ $t('setting.setting_1028') }}</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import { useMediaSettingServer } from 'middle-domain';
  import { debounce } from 'lodash';

  export default {
    data() {
      return {
        mediaState: this.mediaSettingServer.state,
        isSafari: navigator.userAgent.match(/Version\/([\d.]+).*Safari/),
        isPaused: true,
        volume: 0.5
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices.audioOutputDevices;
      }
    },
    watch: {
      volume(value) {
        if (!this.$refs.outputAudioPlayer) return;
        this.$refs.outputAudioPlayer.volume = value;
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    mounted() {
      this.listenEvents();
    },
    beforeDestroy() {
      this.removeEvents();
    },
    methods: {
      listenEvents() {
        // 监听原生的播放、暂停事件
        this.setIsPaused = () => (this.isPaused = true);
        this.setAudioPlay = () => (this.isPaused = false);

        this.$refs.outputAudioPlayer.addEventListener('pause', this.setIsPaused);
        this.$refs.outputAudioPlayer.addEventListener('play', this.setAudioPlay);
      },
      removeEvents() {
        this.$refs.outputAudioPlayer.removeEventListener('pause', this.setIsPaused);
        this.$refs.outputAudioPlayer.removeEventListener('play', this.setAudioPlay);
      },
      pauseAudio() {
        if (this.isPaused === true) return;
        this.$refs.outputAudioPlayer.pause();
      },
      /**
       * 试播音频
       */
      playAudio: debounce(function () {
        if (!this.$refs.outputAudioPlayer) return;
        if (!this.isPaused) return this.$refs.outputAudioPlayer.pause();
        if (!this.mediaState.audioOutput && !this.isSafari)
          return this.$message.warning('无可用的扬声器');
        this.$refs.outputAudioPlayer.play();
      }, 500),
      /**
       * 设备变更
       */
      audioOutputChange() {
        const audioPlayer = this.$refs.outputAudioPlayer;
        if (!audioPlayer) return;

        if (typeof audioPlayer.sinkId === 'undefined') {
          console.warn('Browser does not support output device selection.');
        } else {
          audioPlayer
            .setSinkId(this.mediaState.audioOutput)
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

  .vmp-media-setting-play-tips {
    text-align: center;
    color: #333;
    font-size: 14px;
    margin-bottom: 14px;
  }
</style>
