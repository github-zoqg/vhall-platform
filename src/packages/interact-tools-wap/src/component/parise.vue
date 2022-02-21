<template>
  <div class="vhall-praise">
    <div ref="dianzan" class="v-praise-dom" @touchstart="support">
      <i class="vh-saas-iconfont vh-saas-a-color-givealike"></i>
      <span v-if="like">{{ like | transformWatchNum }}</span>
    </div>
    <div>
      <div class="hello"></div>
    </div>
  </div>
</template>
<script>
  // import EventBus from '../../utils/Events';
  import { usePraiseServer, useRoomBaseServer, useChatServer } from 'middle-domain';

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
      },
      cuid: {
        required: true
      }
    },
    watch: {
      priseLike: {
        handler(val) {
          if (val) {
            this.like = val;
          }
        },
        immediate: true
      }
    },
    beforeCreate() {
      this.praiseServer = usePraiseServer();
      this.roomBaseServer = useRoomBaseServer();
      this.chatServer = useChatServer();
    },
    mounted() {
      this.priseLike = this.roomBaseServer.state.priseLike.total;
      this.praiseServer.listenMsg();
      this.praiseServer.$on('customPraise', msg => {
        // console.log(msg.visitorId, this.roomBaseServer.state.watchInitData.visitor_id);
        if (msg.visitorId != this.roomBaseServer.state.watchInitData.visitor_id) {
          this.like += msg.num;
        }
      });
      // EventBus.$on('tabChange', payload => {
      //   this.$forceUpdate();
      // });

      // EventBus.$on('currentUserPraise', num => {
      //   this.like += num;
      // });

      if (this.localRoomInfo.type != 1) {
        if (timeId) {
          clearInterval(timeId);
        }
      }
    },
    filters: {
      transformWatchNum(num) {
        num = Number(num);
        if (num < 10000) {
          return num;
        } else if (num >= 10000 && num < 1000000) {
          const n = Math.floor(num / 10000);
          let l = Math.floor((num % 10000) / 1000); // eslint-disable-line
          l = l === 0 ? '' : '.' + l;
          return (num = n + l + 'w');
        } else {
          return (num = '999w');
        }
      }
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
        // 通过 eventbus 修改 like 是为了同步两个点赞实例的点赞数量
        // EventBus.$emit('currentUserPraise', 1);
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
      }
    },
    destroyed() {
      clearInterval(timeId);
    }
  };
</script>
<style lang="less">
  .vhall-praise {
    // width: 60px;
    position: relative;
    user-select: none;

    .v-praise-dom {
      position: relative;
      & > span {
        display: flex;
        align-items: center;
        font-size: 18px;
        color: #fff;
        padding: 4px 8px;
        background-color: #ff3030;
        position: absolute;
        top: 0px;
        left: 25px;
        height: 28px;
        line-height: 1;
        // text-align: center;
        border-radius: 12px;
        // display: block;
      }

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
