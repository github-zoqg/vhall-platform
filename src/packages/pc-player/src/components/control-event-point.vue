<template>
  <div
    class="vh-video-tailoring__control-event-point"
    :class="isMini ? 'event-mini-point' : ''"
    :style="{ left: pointLeft + '%' }"
    @mouseenter.stop="hoverPoint"
    @mouseleave.stop="leavePoint"
    @click.stop="showLabelFun"
  >
    <div
      v-show="showLabel"
      ref="eventPointLabel"
      class="vh-video-tailoring__event-content"
      :class="{ lessLeft: Number(eventTime) <= isLeft, lessRight: changeRightStyle }"
    >
      <div class="vh-video-tailoring__content">
        {{ pointTime + ' ' + eventLabel }}
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      /**
       * 事件时间
       */
      eventTime: {
        type: Number,
        default: 0,
        required: true
      },
      /**
       * 事件名
       */
      eventLabel: {
        type: String,
        default: '',
        required: true
      },
      /**
       * 视频实际时长
       */
      videoTime: {
        type: Number,
        required: true
      },
      isMini: {
        type: Boolean,
        required: false,
        default: false
      }
    },
    data() {
      return {
        pointLeft: '0', // 事件点的左坐标
        labelLeft: '0', // 事件点文字的左坐标
        labelTop: '0', // 事件点文字的上坐标
        showLabel: false // 展示提示框
      };
    },
    computed: {
      isLeft() {
        return this.isMini ? 200 : 50;
      },
      isRight() {
        return this.isMini ? 150 : 50;
      },
      changeRightStyle() {
        return Number(this.eventTime) > Number(this.videoTime) - this.isRight;
      },
      /**
       * 事件点文字中的时间初始化
       */
      pointTime() {
        return this.formatTime(this.eventTime);
      }
    },
    watch: {
      /**
       * 监听事件时间变化修改事件点位置
       */
      eventTime(newVal, oldVal) {
        this.pointLeft = ((newVal / this.videoTime) * 100).toFixed(3) - 0.2;
      }
    },
    created() {
      console.log(this.eventTime, this.videoTime, '123456789??????');
      // 事件点的左坐标初始化
      this.pointLeft = ((this.eventTime / this.videoTime) * 100).toFixed(3) - 0.2;
    },
    mounted() {},
    methods: {
      /**
       * 时间格式化
       * 将秒转化为hh:mm:ss显示
       * value 刻度尺格数
       * currentUnit当前时间转换比例
       */
      formatTime(value) {
        var hh = Math.floor(value / 3600);
        if (hh < 10) hh = '0' + hh;
        var mm = Math.floor((value - hh * 3600) / 60);
        if (mm < 10) mm = '0' + mm;
        var ss = Math.floor((value - hh * 3600) % 60);
        if (ss < 10) ss = '0' + ss;
        var length = hh + ':' + mm + ':' + ss;
        if (value >= 0) {
          return length;
        } else {
          return '';
        }
      },
      hoverPoint() {
        this.showLabel = true;
      },
      leavePoint() {
        this.showLabel = false;
      },
      /**
       * 展示提示框
       */
      showLabelFun() {
        this.$emit('showLabel', this.eventTime);
      },
      /**
       * 隐藏提示框
       */
      hideLabelFun() {
        window.labelTimer = setTimeout(() => {
          this.showLabel = false;
          clearTimeout(window.labelTimer);
        }, 3000);
      }
    }
  };
</script>
<style lang="less">
  .vh-video-tailoring__control-event-point {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    top: -5px;
    left: 0px;
    background-color: @font-error;
    z-index: 9;
    cursor: pointer;
    &.event-mini-point {
      top: -6px;
    }
    .vh-video-tailoring__event-content {
      width: 220px;
      text-align: left;
      word-break: break-all;
      position: absolute;
      z-index: 10;
      top: 0;
      left: 0;
      color: @font-error-low;
      transform: translate(-50%, -120%);
      &.lessLeft {
        left: 100px;
      }
      &.lessRight {
        left: -100px;
      }
      .vh-video-tailoring__content {
        font-size: 14px;
        background: @bg-dark-section;
        border: 1px solid @border-bormal;
        box-shadow: 0px 0px 8px 0px rgba(@bg-dark-normal, 0.3);
        border-radius: 4px;
        padding: 10px;
        line-height: 20px;
        color: @font-error-low;
        word-break: break-word;
      }
    }
  }
</style>
