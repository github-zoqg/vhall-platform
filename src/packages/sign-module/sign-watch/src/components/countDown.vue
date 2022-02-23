<template>
  <div class="sign-watch-countdown" functional>
    <svg width="120px" height="120px" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- <defs>
        <linearGradient id="greenGradient" x1="0" y1="100%" x2="100%" y2="0">
          <stop offset="0%" stop-color="#FC5659" />
          <stop offset="50%" stop-color="#FC5659" />
          <stop offset="100%" stop-color="#FFA32B" />
        </linearGradient>
      </defs> -->
      <circle
        class="sign-watch-countdown-progress"
        cx="50%"
        cy="50%"
        r="47"
        fill="#FED8D6"
        stroke="#FED8D6"
        stroke-dasharray="0"
        stroke-dashoffset="1"
      ></circle>
      <circle
        class="sign-watch-countdown-progress sign-watch-countdown-progressBar"
        cx="50%"
        cy="50%"
        r="47"
        fill="#FED8D6"
        stroke="#FB3A32"
        :stroke-dasharray="perimeter"
        :stroke-dashoffset="progress"
        stroke-linecap="square"
      ></circle>
    </svg>

    <div class="sign-watch-countdown-core">
      <div>{{ remainder }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'CountDown',
    props: {
      duration: {
        type: [Number, String],
        default: 30
      },
      consume: {
        type: [Number, String],
        default: 10
      },
      radius: {
        type: [Number, String],
        default: 94
      }
    },
    computed: {
      percent() {
        const ret = this.consume / this.duration;
        return ret > 1 ? 1 : ret;
      },
      progress() {
        return Math.PI * 94 * this.percent;
      },
      remainder() {
        let ret = this.consume;
        let m, s;
        ret = ret > 0 ? ret : 0;
        m = parseInt(ret / 60);
        s = ret % 60;
        m = m > 9 ? m : `0${m}`;
        s = s > 9 ? s : `0${s}`;

        return `${m}:${s}`;
      },
      perimeter() {
        return Math.PI * this.radius;
      }
    }
  };
</script>

<style lang="less" scoped>
  .sign-watch-countdown {
    position: relative;
    width: 120px;
    height: 120px;
    &-core {
      width: 88px;
      height: 88px;
      border-radius: 50%;
      // background-color: #fff2f0;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28px;
      color: @font-light-normal;
      font-weight: bold;
      background-color: #fff9e9;
    }
    > svg {
      transform: rotate(-90deg);
    }
    &-progress {
      stroke-width: 6px;
    }
    &-progressBar {
      // transform: rotate(-90deg);
      // transform: rotateX(-180deg);
      transform-origin: 50%;
      stroke-width: 6px;
    }
  }
</style>
