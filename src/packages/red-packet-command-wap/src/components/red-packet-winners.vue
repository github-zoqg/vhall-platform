<template>
  <div class="vhsaas-interact-dialog other">
    <div class="vhsaas-dialog__other">
      <i class="vhsaas-other-return vh-iconfont vh-line-arrow-left" @click="back" />
      <div class="vhsaas-interact-content">
        <div class="title">{{ $t('interact_tools.interact_tools_1085') }}</div>
        <ul ref="packetList" class="vhsaas-other__item">
          <li v-for="(item, index) in winners" :key="index">
            <div class="winner-info">
              <img :src="item.avatar || defaultAvatar" alt="" />
              <span class="vhsaas-red-packet__item__name">
                {{ item.nickname | overHidden(8) }}
              </span>
            </div>
            <span class="vhsaas-red-packet__time">
              {{ item.created_at | fmtTimeByExp('HH:mm:ss') }}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <slot />
  </div>
</template>
<script>
  import defaultAvatar from '@/app-shared/utils/avatar';
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
    data() {
      return {
        winners: [],
        queryParams: {
          page: 1,
          size: 10 // 翻页为10
        },
        defaultAvatar
      };
    },
    created() {
      this.getRedPacketWinners();
    },
    methods: {
      // 获取红包列表
      getRedPacketWinners() {
        this.redPacketServer
          .getCodeRedPacketWinners({
            pos: this.queryParams.page, // pos 参数不是偏移量,就是页码
            limit: this.queryParams.size
          })
          .then(res => {
            const list = res.data?.list;
            if (list.length) {
              this.winners = [].concat(list);
            }
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
    margin-left: 50%;
    transform: translate(-50%, -10%);
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
      font-size: 44px;
      line-height: 62px;
      color: #fee4b3;
    }
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #ccc;
    }
  }

  .vhsaas-dialog__other {
    background: #ee2121;
    border-radius: 24px;
    position: relative;
    width: 640px;
    max-width: 640px;
    height: 900px;
    .vhsaas-interact-content {
      padding: 64px 24px 24px 24px;
    }
  }
  .vhsaas-other-return {
    font-size: 32px;
    color: #ffffff;
    display: inline-block;
    top: 34px;
    left: 36px;
    cursor: pointer;
    position: absolute;
  }
  .vhsaas-other__item {
    margin-top: 30px;
    width: 100%;
    height: 714px;
    border-radius: 12px;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.9);
    li {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px 0 24px;
    }

    .winner-info {
      display: flex;
      align-items: center;

      img {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 24px;
        margin-left: 0;
        border: 0;
      }
    }
    .vhsaas-red-packet__item__name {
      font-weight: 400;
      color: #1a1a1a;
      font-size: 28px;
      line-height: 28px;
    }
    .vhsaas-red-packet__time {
      font-size: 28px;
      line-height: 28px;
      font-weight: 400;
      color: #666666;
    }
  }
</style>
