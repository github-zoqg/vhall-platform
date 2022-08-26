<template>
  <div>
    <div class="vhall-praise">
      <div @touchstart="support">
        <img class="tool givealike-img" v-if="like" src="../img/icon_like0.png" />
        <img class="tool givealike-img" v-else src="../img/icon_like.png" />
      </div>
      <span v-if="like" class="like" :class="like < 10 ? 'single' : ''">
        {{ like | transformWatchPraise }}
      </span>
    </div>
    <PariseAE />
  </div>
</template>
<script>
  import { usePraiseServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  import PariseAE, { giveParise } from './pariseAE';

  const timeId = null;
  export default {
    components: {
      PariseAE
    },
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
        giveParise(); // 点赞效果
        this.timess++;
        this.like = this.like + 1;
        // this.$forceUpdate();
        if (this.clearSet) {
          window.clearTimeout(this.clearSet);
        } else {
          this.clearSet = null;
        }
        this.clearSet = setTimeout(() => {
          clearTimeout(this.clearSet);
          this.clearSet = null;
          this.praise();
          this.timess = 0;
        }, 2000);
      },
      // 接口请求
      praise() {
        window.vhallReport && window.vhallReport.report('PRAISE');
        const num = this.timess;
        // 数据埋点
        window.vhallReportForWatch?.report(170025, {
          num
        });
        this.praiseServer
          .postPraiseIncrement({
            room_id: this.localRoomInfo.roomId,
            num
          })
          .then(() => {});
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
  }
</style>
