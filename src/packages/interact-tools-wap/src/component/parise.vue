<template>
  <div class="vhall-praise">
    <!-- <div ref="dianzan" class="v-praise-dom" @touchstart="support"> -->
    <div ref="dianzan" class="v-praise-dom" @touchstart="giveLike">
      <img class="tool givealike-img" v-if="like" src="../img/icon_like0.png" />
      <img class="tool givealike-img" v-else src="../img/icon_like.png" />
    </div>
    <span v-if="like" class="like" :class="like < 10 ? 'single' : ''">
      {{ like | transformWatchPraise }}
    </span>
    <div class="like-effect">
      <div class="hello"></div>
    </div>
  </div>
</template>
<script>
  import { usePraiseServer, useRoomBaseServer, useGroupServer } from 'middle-domain';

  const timeId = null;
  export default {
    data() {
      return {
        timess: 0,
        like: 0,
        priseLike: 0
      };
    },
    props: {
      hideChatHistory: {
        require: false
      },
      localRoomInfo: {
        require: false
      }
    },
    beforeCreate() {
      this.praiseServer = usePraiseServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.like = this.roomBaseServer.state.priseLike.total || 0;
    },
    mounted() {
      this.praiseServer.$on('customPraise', msg => {
        if (msg.visitorId != this.roomBaseServer.state.watchInitData.visitor_id) {
          if (msg.num > this.like) {
            // 消息返回的点赞数、是点赞总数
            this.like = msg.num;
          }
        }
      });
      // 结束讨论
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        const { groupInitData } = this.groupServer.state;
        if (!groupInitData.isInGroup) {
          this.like = this.roomBaseServer.state.priseLike.total || 0;
        }
      });

      if (this.localRoomInfo.type != 1) {
        if (timeId) {
          clearInterval(timeId);
        }
      }
    },
    destroyed() {
      clearInterval(timeId);
    },
    methods: {
      // 随机数
      selectRandom(arr) {
        const m = Math.floor(Math.random() * 4);
        return arr[m];
      },

      support(e) {
        const arr = ['praiseMove1', 'praiseMove3', 'praiseMove2', 'praiseMove4'];
        const str = this.selectRandom(arr);
        const doms = document.createElement('i');
        doms.classList.add('xin');
        doms.classList.add(str);
        this.$refs.dianzan.appendChild(doms);
        doms.addEventListener('animationend', function () {
          this.outerHTML = '';
        });
        this.timess++;
        this.like = Number(this.like) + 1;
        this.$forceUpdate();
        if (this.clearSet) {
          window.clearTimeout(this.clearSet);
        } else {
          this.clearSet = null;
        }
        this.clearSet = setTimeout(() => {
          this.praise();
          this.timess = 0;
        }, 2000);
      },
      // 接口请求
      praise() {
        window.vhallReport && window.vhallReport.report('PRAISE');
        const num = this.timess;
        this.praiseServer
          .postPraiseIncrement({
            room_id: this.localRoomInfo.roomId,
            num
          })
          .then(() => {});
      },
      giveLike() {
        this.$zan();
      }
    }
  };
</script>
<style lang="less">
  .vhall-praise {
    user-select: none;
    .like {
      display: flex;
      align-items: flex-end;
      color: #fb2626;
      position: absolute;
      top: 0px;
      right: 16px;
      height: 28px;
      font-size: 20px;
      line-height: 20px;
      font-weight: 400;
      &.single {
        right: 29px;
      }
    }
    .like-effect {
      position: relative;
    }
    .v-praise-dom {
      position: relative;
      top: 2px;
      .vh-saas-iconfont {
        // font-size: 42px;
        font-size: 47px;
        color: #666666;
      }
      @keyframes praiseMove {
        0% {
        }
        20% {
          transform: rotate(15deg) scale(1.2);
        }

        50% {
          transform: rotate(-15deg) scale(1);
        }
        80% {
          transform: rotate(-5deg) scale(1);
        }
        100% {
          transform: rotate(0deg) scale(1);
        }
      }
    }
    // .v-praise-dom-dian {
    //   animation: praiseMove 2s;
    //   transform-origin: left bottom;
    //   -webkit-animation: praiseMove 2s;
    // }

    .hello {
      width: 30px;
      height: 1px;
      top: 2px;
      position: absolute;
      left: -100px;
      .box {
        position: absolute;
        height: 300px;
        width: 300px;
      }
    }
  }

  .xin {
    width: 74px;
    height: 60px;
    position: absolute;
    left: 0px;
    top: 0px;
    &.praiseMove3 {
      animation: praiseMove3 2s;
      background: url('../img/zan-0.png') no-repeat;
      background-size: 75%;
    }
    &.praiseMove2 {
      animation: praiseMove2 2s;
      background: url('../img/zan-1.png') no-repeat;
      background-size: 75%;
    }
    &.praiseMove4 {
      animation: praiseMove4 2s;
      background: url('../img/zan-2.png') no-repeat;
      background-size: 75%;
    }
    &.praiseMove1 {
      animation: praiseMove4 2s;
      background: url('../img/zan-3.png') no-repeat;
      background-size: 75%;
    }
  }

  @keyframes praiseMove1 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }

    100% {
      transform: translate(20px, -200px);
      opacity: 0;
    }
  }
  @keyframes praiseMove2 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }

    100% {
      transform: translate(40px, -200px);
      opacity: 0;
    }
  }
  @keyframes praiseMove3 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }

    100% {
      transform: translate(-10px, -200px);
      opacity: 0;
    }
  }
  @keyframes praiseMove4 {
    0% {
      transform: translate(0, 0);
      opacity: 1;
    }

    100% {
      transform: translate(-20px, -200px);
      opacity: 0;
    }
  }
</style>
