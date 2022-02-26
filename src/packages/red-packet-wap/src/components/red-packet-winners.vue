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
              n: redPacketInfo.get_user_count || 0
            })
          }}
        </span>
      </p>
      <div>
        <ul ref="packetList" class="vhsaas-other__item">
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
            <div>
              <p>
                <span class="vhsaas-red-packet__item__name">
                  {{ item.nickname | splitLenStr(8) }}
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
                  <i></i>
                  {{ $t('interact_tools.interact_tools_1042') }}
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
    filters: {
      splitLenStr: function (name, len) {
        return name && name.length > len ? name.substring(0, len) + '...' : name;
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
          size: 20
        },
        loading: false,
        lock: false // 滚动加载锁定(分页加载)
      };
    },
    methods: {
      // 获取红包列表
      getRedPacketWinners() {
        if (this.loading || this.lock) return false;
        this.loading = true;
        this.redPacketServer
          .getRedPacketWinners({
            pos: (this.queryParams.page - 1) * this.queryParams.size + 1,
            limit: this.queryParams.size
          })
          .then(res => {
            const list = res.data?.list;
            if (list.length) {
              this.winners = this.winners.concat(list);
            }
            if (!list.length || list.length < this.queryParams.size) {
              this.lock = true;
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
    width: 920px;
    height: 880px;
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 21;

    &.other {
      background: transparent;
      height: 838px;
      padding-top: 78px;
      .vhsaas-red-packet-close-btn {
        bottom: 0;
      }
    }
  }

  .vhsaas-dialog__other {
    width: 600px;
    height: 720px;
    background: #ee2121;
    border-radius: 32px;
    padding: 0 0 24px 0;
  }
  .vhsaas-red-packet-cover {
    width: 588px;
    height: 662px;
    background: url(../images/open-bg-cover@2x.png);
    background-size: 100% 100%;
    position: absolute;
    bottom: 24px;
    left: 166px;
    z-index: 25;
  }
  .vhsaas-other-return {
    font-size: 22px;
    color: #ffffff;
    margin-top: 40px;
    display: block;
    margin-left: 44px;
    cursor: pointer;
  }
  /* 看看大家的手气 */
  .vhsaas-other-unit {
    font-size: 68px;
    font-weight: bold;
    color: #fee4b3;
    line-height: 68px;
    text-align: center;
    margin-bottom: 16px;
    margin-top: -16px;
    i {
      font-size: 40px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 20px;
    }
  }
  .vhsaas-other-null {
    text-align: center;
    font-size: 36px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 36px;
    margin-top: -16px;
    margin-bottom: 16px;
    margin-left: 28px;
  }
  .vhsaas-other-type {
    text-align: center;
    margin: 0 0;
    line-height: 32px;
    .vhsaas-red-packet__tag {
      width: auto;
      height: 32px;
      border-radius: 8px;
      border: 1px solid #fde3b2;
      font-size: 24px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 32px;
      margin-right: 12px;
      display: inline-block;
      vertical-align: middle;
    }
    .vhsaas-red-packet__count {
      font-size: 28px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 32px;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .vhsaas-other__item {
    width: 552px;
    height: 520px;
    background: #ffffff;
    margin: 30px auto 0 auto;
    border-radius: 8px;
    overflow-y: auto;
    li {
      padding: 18px 32px 16px 32px;
    }
    .nodata {
      margin-top: 100px;
      color: #595959;
      text-align: center;
    }
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
      border: 0;
      &.vhall-img-max {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: inline-block;
        vertical-align: middle;
        margin-right: 8px;
        border: 4px solid #ffb21f;
      }
    }
    div {
      display: inline-block;
      vertical-align: middle;
      width: calc(100% - 68px);
      p {
        display: flex;
        width: 100%;
        justify-content: flex-start;
        align-items: center;
        margin: 0 0 4px 0;
        &:last-child {
          margin: 0 0;
        }
      }
    }
    .vhsaas-red-packet__item__name {
      font-size: 28px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 28px;
    }
    .vhsaas-red-packet__amount {
      margin-left: auto;
      font-size: 24px;
      font-weight: 400;
      color: #1a1a1a;
      line-height: 132px;
    }
    .vhsaas-red-packet__time {
      font-size: 24px;
      font-weight: 400;
      color: #666666;
      line-height: 34px;
    }
    .vhsaas-red-packet__quean {
      margin-left: auto;
      height: 34px;
      font-size: 24px;
      font-weight: 400;
      color: #ffb21f;
      i {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: url(../images/tiara@2x.png);
        background-size: 100% 100%;
        vertical-align: bottom;
        line-height: 34px;
        margin-right: 4px;
      }
    }
  }
</style>
