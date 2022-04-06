<template>
  <div id="vmp-volume-preview" class="vmp-volume-preview">
    <div class="vmp-volume-preview-current" :style="widthStyle"></div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        rafID: null,
        analyserNode: null,
        width: 0
      };
    },
    computed: {
      widthStyle() {
        return { width: `${this.width}%` };
      }
    },
    methods: {
      initAudio(audioId) {
        if (this.rafID) {
          this.cancelAnalyserUpdates();
        }
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!navigator.getUserMedia) {
          navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        }
        if (!navigator.cancelAnimationFrame) {
          navigator.cancelAnimationFrame =
            navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        }
        if (!navigator.requestAnimationFrame) {
          navigator.requestAnimationFrame =
            navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
        }
        navigator.getUserMedia(
          { audio: { deviceId: audioId } },
          stream => {
            this.stream = stream;
            const audioContext = new AudioContext();
            this.inputPoint = audioContext.createGain();
            this.audioInput = audioContext.createMediaStreamSource(stream);
            this.audioInput.connect(this.inputPoint);

            this.analyserNode = audioContext.createAnalyser();
            this.analyserNode.fftSize = 1024;
            this.inputPoint.connect(this.analyserNode);

            //  播放
            this.scriptNode = audioContext.createScriptProcessor(1024, 1, 1);
            this.audioInput.connect(this.scriptNode);
            this.scriptNode.connect(audioContext.destination);
            // this.audioInput.connect(audioContext.destination);
            this.scriptNode.onaudioprocess = () => {
              this.rafID = window.requestAnimationFrame(this.updateAnalysers);
            };
          },
          e => {
            console.error(e);
          }
        );
      },
      updateAnalysers() {
        if (!this.analyserNode) return;
        const freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(freqByteData);
        let magnitude = 0;
        for (let j = 0; j < this.analyserNode.frequencyBinCount; j++) {
          magnitude += freqByteData[j];
        }
        this.width = magnitude / this.analyserNode.frequencyBinCount;
      },
      cancelAnalyserUpdates() {
        window.cancelAnimationFrame(this.rafID);
        this.inputPoint.disconnect();
        this.audioInput.disconnect();
        this.scriptNode.disconnect();
        this.rafID = null;
        this.inputPoint = null;
        this.audioInput = null;
        this.analyserNode = null;
        this.zeroGain = null;
        this.stream.getTracks().forEach(trackInput => {
          console.log('[interactiveServer]  look stop -5');
          trackInput.stop();
        });
      }
    },
    destroyed() {
      if (this.rafID) {
        this.cancelAnalyserUpdates();
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-volume-preview {
    width: 320px;
    height: 40px;
    margin: auto;
    background: url('./assets/volume_gray.png') no-repeat;
    background-position: left center;
    &-current {
      background: url('./assets/volume_orange.png') no-repeat;
      background-position: left center;
      height: 40px;
      position: relative;
    }
  }
</style>
