<template>
  <!-- 待开启红包 -->
  <div class="vhsaas-interact-dialog close">
    <div class="vhsaas-red-packet-body">
      <!-- 开 - 小金币按钮 -->
      <div @click="openRedPacket">
        <img
          :class="['vhsaas-close-open', opened ? 'open' : 'scale']"
          src="../images/close-open@2x.png"
          alt=""
        />
      </div>
      <!-- 文案 -->
      <h1>
        {{ $tdefault(redPacketInfo.describe) | overHidden(8) }}
      </h1>
      <img
        v-if="redPacketInfo && redPacketInfo.avatar"
        :src="redPacketInfo.avatar || ''"
        alt=""
        class="vhsaas-red-packet-avatar"
      />
      <img v-else src="../images/avatar_default@2x.png" alt="" class="vhsaas-red-packet-avatar" />
      <p>
        {{
          (redPacketInfo && redPacketInfo.nickname ? redPacketInfo.nickname : '') | overHidden(8)
        }}
      </p>
    </div>
    <slot />
  </div>
</template>
<script>
  export default {
    name: 'RedPacketAccept',
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
        accepted: false, // 是否已领取
        opened: false, // 完成红包打开
        opening: false // 点击抢红包请求中
      };
    },
    computed: {
      userId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.user_id;
      }
    },
    methods: {
      openRedPacket() {
        if (this.opening || this.opened) return; // 红包打开中或已打开则拦截
        console.log('clickopenRedPacket');
        if (this.userId == 0) {
          return this.$emit('needLogin');
        }
        const available = this.redPacketServer.state.available;
        const getStatus = () => {
          this.redPacketServer.getRedPacketInfo(this.redPacketInfo.red_packet_uuid).then(() => {
            this.opened = true;
            const st = setTimeout(() => {
              clearTimeout(st);
              this.$emit('navTo', 'RedPacketSuccess');
            }, 1000);
          });
        };
        if (available) {
          this.opening = true; // 打开中
          this.redPacketServer
            .openRedPacket()
            .then(res => {
              if (res.code === 200) {
                this.opened = true;
                const st = setTimeout(() => {
                  clearTimeout(st);
                  this.$emit('navTo', 'RedPacketSuccess');
                }, 1000);
              } else {
                getStatus();
              }
            })
            .catch(() => {
              getStatus();
            })
            .finally(() => {
              this.opening = false;
            });
        } else {
          getStatus();
        }
        // 更新领取后的状态
        this.redPacketServer.setAvailable(false);
        this.redPacketServer.setDotVisible(false);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    width: 920px;
    height: 880px;
    background-size: 100% auto;
    // margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 21;
    overflow: visible;
    &.close {
      background: url(../images/close-bg@2x.png);
      background-size: 100% 100%;
    }
  }
  .vhsaas-close-open {
    width: 128px;
    height: 128px;
    cursor: pointer;
    &.scale {
      -webkit-animation: scaleDraw 1s ease-in-out infinite;
      -ms-animation: scaleDraw 1s ease-in-out infinite;
      animation: scaleDraw 1s ease-in-out infinite;
    }
    @keyframes scaleDraw {
      0% {
        transform: scale(1); /*开始为原始大小*/
      }
      25% {
        transform: scale(0.75); /*缩小为0.75倍*/
      }
      50% {
        transform: scale(1);
      }
      75% {
        transform: scale(0.75);
      }
    }
    &.open {
      -webkit-animation: anim 0.25s infinite alternate;
      -ms-animation: anim 0.25s infinite alternate;
      animation: anim 0.25s infinite alternate;
    }
    @-webkit-keyframes anim {
      from {
        -webkit-transform: rotateY(180deg);
      }
      to {
        -webkit-transform: rotateY(360deg);
      }
    }
    @-ms-keyframes anim {
      from {
        -webkit-transform: rotateY(180deg);
      }
      to {
        -webkit-transform: rotateY(360deg);
      }
    }
    @keyframes anim {
      from {
        -webkit-transform: rotateY(180deg);
      }
      to {
        -webkit-transform: rotateY(360deg);
      }
    }
  }
  .vhsaas-red-packet-body {
    position: absolute;
    z-index: 22;
    top: 240px;
    text-align: center;
    width: 100%;
    left: 0;
    h1 {
      font-size: 44px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #fee4b3;
      line-height: 60px;
      margin-top: 104px;
    }
    p {
      font-size: 28px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #fee4b3;
      line-height: 20px;
      margin-top: 4px;
    }
    .vhsaas-red-packet-avatar {
      display: block;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 44px auto 20px;
    }
  }
</style>
