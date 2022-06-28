<template>
  <div class="vhsaas-interact-dialog other">
    <div class="vhsaas-dialog__other">
      <i class="vhsaas-other-return vh-iconfont vh-line-arrow-left" @click="back" />
      <div class="vhsaas-interact-content">
        <div class="title">{{ $t('interact_tools.interact_tools_1085') }}</div>
        <ul
          ref="packetList"
          class="vhsaas-other__item"
          v-infinite-scroll="getRedPacketWinners"
          :infinite-scroll-disabled="finished || loading"
        >
          <li v-for="(item, index) in winners" :key="index">
            <div class="winner-info">
              <img v-if="item.avatar" :src="item.avatar" alt="" />
              <img v-else src="../images/avatar_default@2x.png" alt="" />
              <span class="vhsaas-red-packet__item__name">
                {{ item.nickname | overHidden(8) }}
              </span>
            </div>
            <span class="vhsaas-red-packet__time">
              {{ item.created_at | fmtTimeByExp('hh:mm:ss') }}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <slot />
  </div>
</template>
<script>
  export default {
    name: 'RedPacketWinners',
    inject: ['redPacketServer'],
    props: {
      redPacketInfo: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    created() {
      this.getRedPacketWinners();
    },
    data() {
      return {
        winners: [],
        queryParams: {
          page: 1,
          size: 10 // 分页为10
        },
        loading: false,
        finished: false // 滚动加载锁定(分页加载)
      };
    },
    methods: {
      // 获取红包列表
      getRedPacketWinners() {
        this.loading = true;
        this.redPacketServer
          .getCodeRedPacketWinners({
            pos: this.queryParams.page, // pos 参数不是偏移量,就是页码
            limit: this.queryParams.size
          })
          .then(res => {
            this.queryParams.page++;
            const list = res.data?.list;
            if (list.length) {
              this.winners = this.winners.concat(list);
            }
            if (!list.length || this.winners.length >= res.data.count) {
              this.finished = true;
            }
          })
          .finally(() => {
            this.loading = false;
          });
      },
      back() {
        this.$emit('navTo', 'RedPacketSuccess');
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;

    &.other {
      background: transparent;
    }
    .title {
      text-align: center;
      font-weight: 600;
      font-size: 18px;
      line-height: 34px;
      color: #fee4b3;
    }
  }

  .vhsaas-dialog__other {
    background: #ee2121;
    border-radius: 16px;
    position: relative;
    width: 300px;
    max-width: 300px;
    height: 400px;
    .vhsaas-interact-content {
      padding: 20px 12px 12px;
    }
  }
  .vhsaas-other-return {
    font-size: 11px;
    color: #ffffff;
    display: inline-block;
    top: 20px;
    left: 22px;
    line-height: 11px;
    cursor: pointer;
    position: absolute;
  }
  .vhsaas-other__item {
    margin-top: 14px;
    width: 100%;
    height: 320px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    overflow-y: auto;
    li {
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px 0 16px;
    }

    .winner-info {
      display: flex;
      align-items: center;
      img {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
        margin-left: 0;
        border: 0;
      }
    }
    .vhsaas-red-packet__item__name {
      font-size: 14px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 14px;
    }
    .vhsaas-red-packet__time {
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      line-height: 14px;
    }
  }
</style>
