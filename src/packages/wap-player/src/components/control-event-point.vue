<template>
  <div
    class="vh-video-tailoring__control-event-point"
    :style="{ left: pointLeft + '%' }"
    @click.stop="showLabelFun"
  >
    <div v-show="showLabel" ref="eventPointLabel" class="vh-video-tailoring__event-content">
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
      /**
       * 展示提示框
       */
      showLabelFun(e) {
        this.showLabel = true;
        this.hideLabelFun();
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
    top: 8px;
    background-color: #fb3a32;
    z-index: 3;
    .vh-video-tailoring__event-content {
      width: 220px;
      text-align: left;
      word-break: break-all;
      position: absolute;
      z-index: 9;
      top: 0;
      left: 0;
      color: #fff;
      transform: translate(-50%, -120%);
      .vh-video-tailoring__content {
        font-size: 14px;
        background: #171717;
        border: 1px solid #333333;
        box-shadow: 0px 0px 8px 0px rgba(#1c1c26, 0.3);
        border-radius: 4px;
        padding: 10px 20px;
        line-height: 20px;
        color: #fafafa;
      }
    }
  }
</style>
