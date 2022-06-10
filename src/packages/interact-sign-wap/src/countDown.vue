<template>
  <div class="countdown">
    <svg
      class="countdown-ani"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FC4E2A" />
          <stop offset="100%" stop-color="#FC9A32" />
        </linearGradient>
      </defs>
      <!-- 内环 -->
      <circle
        class="progress"
        cx="50%"
        cy="50%"
        :r="r"
        fill="transparent"
        stroke="#FED8D6"
        stroke-dasharray="0"
        stroke-dashoffset="1"
      ></circle>
      <!-- 外环 -->
      <circle
        class="progress progress-bar"
        cx="50%"
        cy="50%"
        :r="r"
        fill="transparent"
        stroke="url(#greenGradient)"
        :stroke-dasharray="perimeter"
        :stroke-dashoffset="progress"
        stroke-linecap="round"
        stroke-width="7"
      ></circle>
      <!-- 小白点 -->
      <circle cx="92" cy="50%" r="2" fill="white"></circle>
    </svg>

    <div class="countdown-core">
      <div>{{ remainder }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'countDown',
    data() {
      return {
        r: 42 //圆的半径
      };
    },
    props: {
      duration: {
        type: [Number, String],
        default: 30
      },
      consume: {
        type: [Number, String],
        default: 29
      }
    },
    computed: {
      percent() {
        const ret = this.consume / this.duration;
        return ret > 1 ? 1 : ret;
      },
      perimeter() {
        return Math.PI * 2 * this.r;
      },
      progress() {
        return this.perimeter * this.percent;
      },
      remainder() {
        // eslint-disable-next-line one-var
        let ret = this.consume,
          m,
          s;
        ret = ret > 0 ? ret : 0;
        m = parseInt(ret / 60);
        s = ret % 60;
        m = m > 9 ? m : `0${m}`;
        s = s > 9 ? s : `0${s}`;
        return `${m}:${s}`;
      }
    }
  };
</script>

<style lang="less" scoped>
  .countdown {
    position: relative;
    width: 240px;
    height: 240px;
    &-core {
      width: 210px;
      height: 210px;
      border-radius: 50%;
      // background-color: #fff2f0;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 50px;
      color: @font-light-normal;
      font-weight: bold;
      font-family: 'DIN Alternate';
      // background-color: #fff;
    }
    // &-ani {
    //   width: 238px;
    //   height: 238px;
    // }
    > svg {
      transform: rotate(-90deg);
    }
  }
  .progress {
    stroke-width: 8px;
  }
  .progress-bar {
    transform-origin: 50%;
    stroke-width: 14px;
  }
</style>
