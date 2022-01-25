<template>
  <section>
    <main>
      <section class="vmp-media-setting-item">
        <el-select
          class="vmp-media-setting-item__content"
          v-model="selectedId"
          @change="audioInputChange"
        >
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
          :audioId="selectedId"
        />
      </section>
    </main>
    <footer>
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">
          <p>对着麦克风讲话，看不到音量条波动？</p>
          <p>试试以下方法：</p>
        </section>
        <section class="vmp-media-setting-tips__content">
          <p>1. 请允许浏览器使用麦克风权限</p>
          <p>2. 确认麦克风没有被其他程序占用</p>
          <p>3. 选择外置麦克风或者更换电脑</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import PreviewAudio from '@/packages/volume-preview/src/main.vue';
  export default {
    components: {
      PreviewAudio
    },
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
    watch: {
      selectedId() {
        this.setAudioInput();
      }
    },
    mounted() {},
    methods: {
      async audioInputChange(selectedId) {
        selectedId && this.$emit('update:selectedId', selectedId);
      },
      async setAudioInput(id = this.selectedId) {
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
