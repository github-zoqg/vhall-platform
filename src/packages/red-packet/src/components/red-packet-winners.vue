<template>
  <div class="vhsaas-interact-dialog other">
    <div class="vhsaas-dialog__other">
      <i class="vhsaas-other-return vh-iconfont vh-line-arrow-left" @click="back" />
      <p v-if="amount > 0" class="vhsaas-other-unit">
        <i>￥</i>
        {{ amount }}
      </p>
      <p v-if="!(amount > 0)" class="vhsaas-other-null">
        {{ $t('interact_tools.interact_tools_1034') + $t('interact_tools.interact_tools_1035') }}
      </p>
      <p class="vhsaas-other-type">
        <span class="vhsaas-red-packet__tag">
          {{
            redPacketInfo.type === 0
              ? $t('interact_tools.interact_tools_1040')
              : $t('interact_tools.interact_tools_1041')
          }}
        </span>
        <span class="vhsaas-red-packet__count">
          {{
            $t('interact_tools.interact_tools_1043', {
              n: `${redPacketInfo.get_user_count}/${redPacketInfo.number}`
            })
          }}
        </span>
      </p>
      <div>
        <ul
          ref="packetList"
          class="vhsaas-other__item"
          v-infinite-scroll="getRedPacketWinners"
          :infinite-scroll-disabled="finished || loading"
        >
          <li v-for="(item, index) in winners" :key="index">
            <img
              v-if="item.avatar"
              :src="item.avatar"
              alt=""
              :class="{
                'vhall-img-max':
                  redPacketInfo && redPacketInfo.type === 0 && item.amount_ranking == 1
              }"
            />
            <img v-else src="../images/avatar_default@2x.png" alt="" />
            <div class="winner-info">
              <p>
                <span class="vhsaas-red-packet__item__name">
                  {{ item.nickname | overHidden(8) }}
                </span>
                <span class="vhsaas-red-packet__amount">
                  <i>￥</i>
                  {{ item.amount }}
                </span>
              </p>
              <p>
                <span class="vhsaas-red-packet__time">{{ item.created_at }}</span>
                <span
                  v-if="redPacketInfo.type === 0 && item.amount_ranking == 1"
                  class="vhsaas-red-packet__quean"
                >
                  <i />
                  <span v-text="$t('interact_tools.interact_tools_1042')"></span>
                </span>
              </p>
            </div>
          </li>
          <li v-if="winners.length == 0" class="nodata">{{ $t('webinar.webinar_1006') }}~</li>
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
      },
      amount: {
        type: Number,
        default() {
          return 0;
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
          size: 50 // 分页为50
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
          .getRedPacketWinners({
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
    width: 460px;
    height: 440px;
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
      height: 419px;
      padding-top: 39px;
      .vhsaas-red-packet-close-btn {
        bottom: 0;
      }
    }
  }

  .vhsaas-dialog__other {
    background: #ee2121;
    border-radius: 16px;
    padding: 24px 12px 12px;
    position: relative;
  }
  .vhsaas-other-return {
    font-size: 11px;
    color: #ffffff;
    display: inline-block;
    left: 22px;
    line-height: 11px;
    cursor: pointer;
    position: absolute;
  }
  /* 看看大家的手气 */
  .vhsaas-other-unit {
    font-size: 34px;
    font-weight: bold;
    color: #fee4b3;
    line-height: 34px;
    text-align: center;
    margin-bottom: 8px;
    margin-top: -8px;
    i {
      font-size: 20px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 20px;
    }
  }
  .vhsaas-other-null {
    text-align: center;
    font-size: 18px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 18px;
    margin-top: -8px;
    margin-bottom: 8px;
    margin-left: 14px;
  }
  .vhsaas-other-type {
    text-align: center;
    margin: 0 0;
    line-height: 16px;
    .vhsaas-red-packet__tag {
      width: auto;
      height: 16px;
      border-radius: 4px;
      border: 1px solid #fde3b2;
      font-size: 12px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 16px;
      margin-right: 6px;
      display: inline-block;
      vertical-align: middle;
    }
    .vhsaas-red-packet__count {
      font-size: 14px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 16px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .vhsaas-other__item {
    margin-top: 15px;
    width: 276px;
    height: 260px;
    background: #ffffff;
    border-radius: 4px;
    overflow-y: auto;
    li {
      height: 52px;
      padding: 9px 16px 8px 16px;
    }
    .nodata {
      margin-top: 100px;
      color: #595959;
      text-align: center;
    }
    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      margin-right: 4px;
      border: 0;
      &.vhall-img-max {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 4px;
        border: 2px solid #ffb21f;
      }
    }
    .winner-info {
      display: inline-block;
      vertical-align: middle;
      width: calc(100% - 34px);
      p {
        line-height: initial;
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        margin: 0 0 2px 0;
        &:last-child {
          margin: 0;
        }
      }
    }
    .vhsaas-red-packet__item__name {
      font-size: 14px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 14px;
    }
    .vhsaas-red-packet__amount {
      margin-left: auto;
      font-size: 12px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 16px;
    }
    .vhsaas-red-packet__time {
      font-size: 12px;
      font-weight: 400;
      color: #666666;
      line-height: 17px;
    }
    .vhsaas-red-packet__quean {
      // margin-left: auto;
      height: 17px;
      font-size: 12px;
      color: #ffb21f;
      i {
        display: inline-block;
        width: 15px;
        height: 15px;
        background: url(../images/tiara@2x.png);
        background-size: 100% 100%;
        vertical-align: bottom;
        line-height: 15px;
        margin-right: 2px;
      }
    }
  }
</style>
