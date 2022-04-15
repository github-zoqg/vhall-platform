<template>
  <div class="vmp-praise">
    <span class="vmp-praise-num" v-if="praiseNum">{{ praiseNum }}</span>
    <div class="vmp-praise-icon">
      <img
        class="vmp-praise-icon-img"
        :class="isActive ? 'active' : ''"
        src="./img/praise-icon.png"
        alt=""
        @click="handlePraise"
      />
    </div>
    <div class="vmp-praise-bubble" v-show="bubbleList.length">
      <div
        v-for="item in bubbleList"
        :key="item.timestamp"
        :class="item.className"
        class="vmp-praise-bubble-img"
      ></div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, usePraiseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpPraise',
    data() {
      return {
        praiseNum: 0, //点赞数量
        isActive: false, // 是否激活点赞
        bubbleList: [],
        totalPraiseNum: 0, // 点赞数量
        increment: 0 // 点赞增量
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.praiseServer = usePraiseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      // 从接口拿到点赞数量
      this.totalPraiseNum = this.roomBaseServer.state.priseLike.total || 0;
      this.praiseNum = this.transformWatchNum(this.totalPraiseNum);
    },
    mounted() {
      // 别人点赞收到消息，更新点赞数
      this.praiseServer.$on('customPraise', msg => {
        // 如果不是自己点的赞，就加点赞数
        if (msg.visitorId != this.roomBaseServer.state.watchInitData.visitor_id) {
          if (msg.num > this.totalPraiseNum) {
            this.totalPraiseNum = msg.num;
            // 消息返回的点赞数、是点赞总数
            this.praiseNum = this.transformWatchNum(this.totalPraiseNum);
          }
        }
      });
      // 结束/踢出/解散讨论，回到主直播间，点赞数恢复之前的点赞数
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        const { groupInitData } = this.groupServer.state;
        if (!groupInitData.isInGroup) {
          this.totalPraiseNum = this.roomBaseServer.state.priseLike.total || 0;
          this.praiseNum = this.transformWatchNum(this.totalPraiseNum);
        }
      });
    },
    methods: {
      // 点赞事件，是自己点的赞，就自动加数量
      handlePraise() {
        this.handleAnimation();
        if (this.postPraiseTimer) {
          window.clearTimeout(this.postPraiseTimer);
          this.postPraiseTimer = null;
        }
        this.increment++;
        this.totalPraiseNum = this.totalPraiseNum + 1;
        this.praiseNum = this.transformWatchNum(this.totalPraiseNum);
        // 调点赞接口的延时器，防抖，最后一次点击按钮的两秒之后统一调接口和发消息
        this.postPraiseTimer = setTimeout(() => {
          this.praise();
          this.increment = 0;
        }, 2000);
      },
      // 点赞方法
      praise() {
        const num = this.increment;
        const { watchInitData } = this.roomBaseServer.state;
        window.vhallReport && window.vhallReport.report('PRAISE');
        this.praiseServer.postPraiseIncrement({
          room_id: watchInitData.interact.room_id,
          num
        });
      },
      // 点赞组件的动画控制
      handleAnimation() {
        // this.animationTimer 为控制点赞按钮动画的延时器
        if (!this.animationTimer) {
          this.isActive = true;
          this.animationTimer = setTimeout(() => {
            this.isActive = false;
            this.animationTimer = null;
          }, 500);
        }
        // this.deleteBubbleTimer 为控制删除点赞动画元素的延时器
        if (this.deleteBubbleTimer) {
          clearTimeout(this.deleteBubbleTimer);
        }
        this.deleteBubbleTimer = setTimeout(() => {
          // 出于性能的考虑，五秒钟之后将点赞的动画元素全部移除
          this.bubbleList = [];
          this.deleteBubbleTimer = null;
        }, 1000);
        const bubbleItem = [
          { className: 'vmp-praise__bubble01', timestamp: 'b01' + Date.now() },
          { className: 'vmp-praise__bubble02', timestamp: 'b02' + Date.now() },
          { className: 'vmp-praise__bubble03', timestamp: 'b03' + Date.now() },
          { className: 'vmp-praise__bubble04', timestamp: 'b04' + Date.now() },
          { className: 'vmp-praise__bubble05', timestamp: 'b05' + Date.now() },
          { className: 'vmp-praise__bubble06', timestamp: 'b06' + Date.now() },
          { className: 'vmp-praise__bubble07', timestamp: 'b07' + Date.now() },
          { className: 'vmp-praise__bubble08', timestamp: 'b08' + Date.now() },
          { className: 'vmp-praise__bubble09', timestamp: 'b09' + Date.now() },
          { className: 'vmp-praise__bubble10', timestamp: 'b10' + Date.now() },
          { className: 'vmp-praise__bubble11', timestamp: 'b11' + Date.now() },
          { className: 'vmp-praise__bubble12', timestamp: 'b12' + Date.now() },
          { className: 'vmp-praise__bubble13', timestamp: 'b13' + Date.now() },
          { className: 'vmp-praise__bubble14', timestamp: 'b14' + Date.now() },
          { className: 'vmp-praise__bubble15', timestamp: 'b15' + Date.now() },
          { className: 'vmp-praise__bubble16', timestamp: 'b16' + Date.now() },
          { className: 'vmp-praise__bubble17', timestamp: 'b17' + Date.now() },
          { className: 'vmp-praise__bubble18', timestamp: 'b18' + Date.now() },
          { className: 'vmp-praise__bubble19', timestamp: 'b19' + Date.now() },
          { className: 'vmp-praise__bubble20', timestamp: 'b20' + Date.now() },
          { className: 'vmp-praise__bubble21', timestamp: 'b21' + Date.now() },
          { className: 'vmp-praise__bubble22', timestamp: 'b22' + Date.now() },
          { className: 'vmp-praise__bubble23', timestamp: 'b23' + Date.now() },
          { className: 'vmp-praise__bubble24', timestamp: 'b24' + Date.now() },
          { className: 'vmp-praise__bubble25', timestamp: 'b25' + Date.now() },
          { className: 'vmp-praise__bubble26', timestamp: 'b26' + Date.now() },
          { className: 'vmp-praise__bubble27', timestamp: 'b27' + Date.now() },
          { className: 'vmp-praise__bubble28', timestamp: 'b28' + Date.now() },
          { className: 'vmp-praise__bubble29', timestamp: 'b29' + Date.now() }
        ];
        this.bubbleList = [...this.bubbleList, ...bubbleItem];
      },
      // 转换点赞数量的显示格式
      transformWatchNum(num) {
        if (num < 10000) {
          return num;
        } else {
          const n = (num / 10000).toFixed(1);
          if (n > 999.9) {
            return '999.9w';
          }
          return n + 'w';
        }
      }
    }
  };
</script>
<style lang="less">
  @bubble_time: 0.7s;
  @bubble_y_time: 0.7s;
  .vmp-praise {
    height: 100%;
    position: relative;
    &-icon {
      width: 32px;
      height: 32px;
      line-height: 32px;
      background: linear-gradient(180deg, #ff765a 0%, #f6261d 100%);
      border-radius: 16px;
      cursor: pointer;
      margin-left: 16px;
      &-img {
        width: 32px;
        height: 32px;
        transform-origin: left center;
        &.active {
          animation: praise 0.5s ease-in;
        }
        @keyframes praise {
          0% {
            transform: rotate(0deg);
          }
          20% {
            transform: rotate(-3deg);
          }
          40% {
            transform: rotate(10deg);
          }
          60% {
            transform: rotate(-3deg);
          }
          80% {
            transform: rotate(10deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      }
    }
    &-num {
      position: absolute;
      bottom: 22px;
      left: 36px;
      background: @bg-error-light;
      height: 17px;
      border-radius: 9px;
      line-height: 17px;
      padding: 0 6px;
      font-size: 12px;
      color: @font-error-low;
      border: solid 1px @border-tools-color;
      white-space: nowrap;
    }
    &-bubble {
      width: 400px;
      height: 280px;
      position: absolute;
      top: -287px;
      left: -184px;
      z-index: 15;
      &-img {
        position: absolute;
        width: 80px;
        height: 80px;
        left: 145px;
        bottom: 0px;
        background-repeat: no-repeat;
        background-position: center bottom;
        transform-origin: bottom;
      }
    }
    &__bubble01 {
      background-image: url(./img/666.png);
      animation: bubble_1 @bubble_time linear 1 forwards,
        bubble_y_1 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_1 {
      0% {
        transform: translateX(0px) scale(0.3);
      }
      75% {
        transform: translateX(80px) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateX(80px) scale(1);
        opacity: 0;
      }
    }
    @keyframes bubble_y_1 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 50px;
      }
    }
    &__bubble02 {
      background-image: url(./img/heart.png);
      animation: bubble_2 @bubble_time linear 1 forwards,
        bubble_y_2 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_2 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(50px) scale(0.7) rotate(-27deg);
        opacity: 1;
      }
      100% {
        transform: translateX(50px) scale(0.7) rotate(-27deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_2 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 10px;
      }
    }
    &__bubble03 {
      background-image: url(./img/heart.png);
      animation: bubble_3 @bubble_time linear 1 forwards,
        bubble_y_3 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_3 {
      0% {
        transform: translateX(0px) scale(0.3);
      }
      75% {
        transform: translateX(80px) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateX(80px) scale(1);
        opacity: 0;
      }
    }
    @keyframes bubble_y_3 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 120px;
      }
    }
    &__bubble04 {
      background-image: url(./img/face.png);
      animation: bubble_4 @bubble_time linear 1 forwards,
        bubble_y_4 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_4 {
      0% {
        transform: translateX(0px) scale(0.3);
      }
      75% {
        transform: translateX(50px) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateX(50px) scale(1);
        opacity: 0;
      }
    }
    @keyframes bubble_y_4 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 90px;
      }
    }

    &__bubble05 {
      background-image: url(./img/yellow-star.png);
      animation: bubble_5 @bubble_time linear 1 forwards,
        bubble_y_5 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_5 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(110px) scale(1) rotate(110deg);
        opacity: 1;
      }
      100% {
        transform: translateX(110px) scale(1) rotate(110deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_5 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 105px;
      }
    }
    &__bubble06 {
      background-image: url(./img/line1.png);
      animation: bubble_6 @bubble_time linear 1 forwards,
        bubble_y_6 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_6 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(160px) scale(1) rotate(-5deg);
        opacity: 1;
      }
      100% {
        transform: translateX(160px) scale(1) rotate(-5deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_6 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 125px;
      }
    }

    &__bubble07 {
      background-image: url(./img/line2.png);
      animation: bubble_7 @bubble_time linear 1 forwards,
        bubble_y_7 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_7 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(180px) scale(1) rotate(-5deg);
        opacity: 1;
      }
      100% {
        transform: translateX(180px) scale(1) rotate(-5deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_7 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 150px;
      }
    }

    &__bubble08 {
      background-image: url(./img/heart.png);
      animation: bubble_8 @bubble_time linear 1 forwards,
        bubble_y_8 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_8 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(125px) scale(0.4) rotate(90deg);
        opacity: 1;
      }
      100% {
        transform: translateX(125px) scale(0.4) rotate(90deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_8 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 82px;
      }
    }

    &__bubble09 {
      background-image: url(./img/heart.png);
      animation: bubble_9 @bubble_time linear 1 forwards,
        bubble_y_9 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_9 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(115px) scale(0.4) rotate(40deg);
        opacity: 1;
      }
      100% {
        transform: translateX(115px) scale(0.4) rotate(40deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_9 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 170px;
      }
    }
    &__bubble10 {
      background-image: url(./img/gray-ellipse.png);
      animation: bubble_10 @bubble_time linear 1 forwards,
        bubble_y_10 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_10 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(165px) scale(1) rotate(75deg);
        opacity: 1;
      }
      100% {
        transform: translateX(165px) scale(1) rotate(75deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_10 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 190px;
      }
    }

    &__bubble11 {
      background-image: url(./img/blue-ellipse.png);
      animation: bubble_11 @bubble_time linear 1 forwards,
        bubble_y_11 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_11 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(162px) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(162px) scale(1) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_11 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 200px;
      }
    }
    &__bubble12 {
      background-image: url(./img/yellow-star.png);
      animation: bubble_12 @bubble_time linear 1 forwards,
        bubble_y_12 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_12 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(140px) scale(1) rotate(110deg);
        opacity: 1;
      }
      100% {
        transform: translateX(140px) scale(1) rotate(110deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_12 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 210px;
      }
    }

    &__bubble13 {
      background-image: url(./img/praise-icon1.png);
      animation: bubble_13 @bubble_time linear 1 forwards,
        bubble_y_13 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_13 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(135px) scale(0.5) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(135px) scale(0.5) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_13 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 235px;
      }
    }

    &__bubble14 {
      background-image: url(./img/face.png);
      animation: bubble_14 @bubble_time linear 1 forwards,
        bubble_y_14 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_14 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(70px) scale(1) rotate(-18deg);
        opacity: 1;
      }
      100% {
        transform: translateX(70px) scale(1) rotate(-18deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_14 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 184px;
      }
    }

    &__bubble15 {
      background-image: url(./img/yellow-ellipse.png);
      animation: bubble_15 @bubble_time linear 1 forwards,
        bubble_y_15 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_15 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(50px) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(50px) scale(1) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_15 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 225px;
      }
    }

    &__bubble16 {
      background-image: url(./img/blue-star.png);
      animation: bubble_16 @bubble_time linear 1 forwards,
        bubble_y_16 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_16 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-6px) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-6px) scale(1) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_16 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 45px;
      }
    }
    &__bubble17 {
      background-image: url(./img/heart.png);
      animation: bubble_17 @bubble_time linear 1 forwards,
        bubble_y_17 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_17 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-26px) scale(0.4) rotate(-70deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-26px) scale(0.4) rotate(-70deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_17 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 55px;
      }
    }
    &__bubble18 {
      background-image: url(./img/praise-icon1.png);
      animation: bubble_18 @bubble_time linear 1 forwards,
        bubble_y_18 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_18 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-6px) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-6px) scale(1) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_18 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 70px;
      }
    }

    &__bubble19 {
      background-image: url(./img/heart.png);
      animation: bubble_19 @bubble_time linear 1 forwards,
        bubble_y_19 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_19 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(6px) scale(0.4) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(6px) scale(0.4) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_19 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 110px;
      }
    }

    &__bubble20 {
      background-image: url(./img/heart.png);
      animation: bubble_20 @bubble_time linear 1 forwards,
        bubble_y_20 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_20 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(20px) scale(0.7) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(20px) scale(0.7) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_20 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 112px;
      }
    }
    &__bubble21 {
      background-image: url(./img/yellow-ellipse.png);
      animation: bubble_21 @bubble_time linear 1 forwards,
        bubble_y_21 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_21 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-60px) scale(0.3) rotate(60deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-60px) scale(0.3) rotate(60deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_21 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 85px;
      }
    }

    &__bubble22 {
      background-image: url(./img/yellow-star.png);
      animation: bubble_22 @bubble_time linear 1 forwards,
        bubble_y_22 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_22 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(22px) scale(1) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(22px) scale(1) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_22 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 155px;
      }
    }
    &__bubble23 {
      background-image: url(./img/blue-ellipse.png);
      animation: bubble_23 @bubble_time linear 1 forwards,
        bubble_y_23 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_23 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(22px) scale(1) rotate(90deg);
        opacity: 1;
      }
      100% {
        transform: translateX(22px) scale(1) rotate(90deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_23 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 225px;
      }
    }

    &__bubble24 {
      background-image: url(./img/666.png);
      animation: bubble_24 @bubble_time linear 1 forwards,
        bubble_y_24 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_24 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-26px) scale(0.5) rotate(25deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-26px) scale(0.5) rotate(25deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_24 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 190px;
      }
    }
    &__bubble25 {
      background-image: url(./img/line3.png);
      animation: bubble_25 @bubble_time linear 1 forwards,
        bubble_y_25 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_25 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-84px) scale(1) rotate(-5deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-84px) scale(1) rotate(-5deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_25 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 170px;
      }
    }

    &__bubble26 {
      background-image: url(./img/diamond.png);
      animation: bubble_26 @bubble_time linear 1 forwards,
        bubble_y_26 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_26 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-34px) scale(1) rotate(-35deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-34px) scale(1) rotate(-35deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_26 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 130px;
      }
    }

    &__bubble27 {
      background-image: url(./img/face.png);
      animation: bubble_27 @bubble_time linear 1 forwards,
        bubble_y_27 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_27 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-94px) scale(0.8) rotate(0deg) rotateY(180deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-94px) scale(0.8) rotate(0deg) rotateY(180deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_27 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 106px;
      }
    }

    &__bubble28 {
      background-image: url(./img/heart.png);
      animation: bubble_28 @bubble_time linear 1 forwards,
        bubble_y_28 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_28 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-166px) scale(0.5) rotate(-30deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-166px) scale(0.5) rotate(-30deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_28 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 150px;
      }
    }
    &__bubble29 {
      background-image: url(./img/heart.png);
      animation: bubble_29 @bubble_time linear 1 forwards,
        bubble_y_29 @bubble_y_time ease-out 1 forwards;
    }
    @keyframes bubble_29 {
      0% {
        transform: translateX(0px) scale(0.3) rotate(0deg);
      }
      75% {
        transform: translateX(-160px) scale(0.3) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateX(-160px) scale(0.3) rotate(0deg);
        opacity: 0;
      }
    }
    @keyframes bubble_y_29 {
      0% {
        margin-bottom: 0;
      }
      100% {
        margin-bottom: 148px;
      }
    }
  }
</style>
