<template>
  <section class="vh-media-check-audioinput">
    <main>
      <!-- 选择音频输入设备(话筒) -->
      <section class="vh-media-check-selector">
        <label>麦克风</label>
        <el-select v-model="selectedId" @change="audioChange">
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>

      <!-- 音量显示 -->
      <div class="vh-check-box microphone-preview">
        <preview-audio ref="previewAudio" :audioId="selectedId" />
      </div>
    </main>

    <footer class="vh-media-check-footer">
      <div class="vh-check-tip">
        <span class="iconfont iconmaikefeng_icon icon-tip"></span>
        <span>对着麦克风讲话，您能看到音量条波动么？</span>
      </div>
      <div class="button-container button-container__microphone">
        <el-button
          round
          class="confirm"
          type="primary"
          :class="{ disable: !audioReady }"
          @click="success"
        >
          能看到
        </el-button>
        <el-button round class="cancel" :class="{ disable: !audioReady }" @click="fail">
          看不到
        </el-button>
      </div>
    </footer>
  </section>
</template>

<script>
  import PreviewAudio from '@/packages/volume-preview/src/main.vue';

  export default {
    name: 'choose-audio-input',
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
    components: {
      PreviewAudio
    },
    data() {
      return {
        selectedId: ''
      };
    },
    watch: {
      defaultSelected(cur) {
        this.setSelectedId(cur);
      }
    },
    mounted() {
      this.setSelectedId(this.defaultSelected);
    },
    methods: {
      setSelectedId(id) {
        this.selectedId = this.selectedId || id;
        this.audioChange();
      },
      async audioChange() {
        const mediaOptions = { audio: { deviceId: this.selectedAudioDeviceId } };
        const stream = await navigator.mediaDevices.getUserMedia(mediaOptions);
        stream.getTracks().forEach(trackInput => {
          trackInput.stop();
        });
        this.$refs.previewAudio.initAudio(this.selectedId);
      },

      success() {
        this.$emit('next', { result: 'success' });
      },
      fail() {
        this.$emit('next', { result: 'fail' });
      }
    }
  };
</script>

<style lang="less">
  .vh-media-check-audioinput {
    // selector
    .vh-media-check-selector {
      display: flex;
      align-items: center;
      margin-top: 11px;

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

    // footer
    .vh-media-check-footer {
      margin-top: 32px;
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
        &.audio-preview {
          padding-top: 15px;
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
