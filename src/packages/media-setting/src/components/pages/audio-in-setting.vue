<template>
  <section>
    <main>
      <section class="vmp-media-setting-item">
        <el-select class="vmp-media-setting-item__content" v-model="mediaState.audioInput">
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>
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
          <p>{{ $t('setting.setting_1019') }}：</p>
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
      },
      devices(val) {
        if (val && val.length) {
          this.mediaState.audioInput = val[0].deviceId;
        } else {
          sessionStorage.removeItem('selectedAudioDeviceId');
        }
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    methods: {
      async setAudioInput(id) {
        if (!this.$refs.previewAudio) return;

        const mediaOptions = { audio: { deviceId: id } };
        const stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
        stream.getTracks().forEach(trackInput => {
          trackInput.stop();
        });
        this.$refs.previewAudio.initAudio(id);
      }
    }
  };
</script>

<style></style>
