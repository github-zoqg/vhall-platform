<template>
  <section>
    <main>
      <!-- 选择录音设备 -->
      <section class="vmp-media-setting-item">
        <el-select
          class="vmp-media-setting-item__content"
          :placeholder="$t('form.form_1018')"
          v-model="mediaState.audioInput"
          v-if="devices.length != 0"
        >
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
        <el-select
          class="vmp-media-setting-item__content"
          value=""
          v-if="devices.length == 0"
          disabled
        >
          <el-option key="" value="" :label="$t('setting.setting_1033')"></el-option>
        </el-select>
      </section>

      <!-- 音量条按钮 -->
      <section class="vmp-media-setting-item">
        <preview-audio
          ref="previewAudio"
          class="vmp-media-setting-item__content"
          :audioId="mediaState.audioInput"
        />
      </section>
    </main>

    <footer>
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">
          <p>{{ $t('setting.setting_1018') }}</p>
          <p>{{ $t('setting.setting_1019') }}</p>
        </section>
        <section class="vmp-media-setting-tips__content">
          <p>1. {{ $t('setting.setting_1020') }}</p>
          <p>2. {{ $t('setting.setting_1021') }}</p>
          <p>3. {{ $t('setting.setting_1022') }}</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import { useMediaSettingServer } from 'middle-domain';
  import PreviewAudio from '@/packages/volume-preview/src/main.vue';
  export default {
    components: {
      PreviewAudio
    },
    data() {
      return {
        mediaState: this.mediaSettingServer.state
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices.audioInputDevices;
      }
    },
    watch: {
      'mediaState.audioInput'(val) {
        this.setAudioInput(val);
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    methods: {
      /**
       * 绑定音频输入，使得可以响应音频大小波动
       * @param {String} id audio设备id
       */
      async setAudioInput(id) {
        if (!this.$refs.previewAudio) return;
        if (this.devices.length === 0) {
          return;
        }

        const mediaOptions = { audio: { deviceId: id } };
        const stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
        stream.getTracks().forEach(trackInput => {
          console.log('[interactiveServer]  look stop -4');
          trackInput.stop();
        });
        this.$refs.previewAudio.initAudio(id);
      }
    }
  };
</script>

<style></style>
