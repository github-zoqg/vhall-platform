<template>
  <!-- 待开启红包 -->
  <div class="vhsaas-interact-dialog close">
    <div class="vhsaas-red-packet-body">
      <!-- 开 - 小金币按钮 -->
      <img
        :class="['vhsaas-close-open', opened ? 'open' : 'scale']"
        src="../images/close-open@2x.png"
        alt=""
        @click="openRedPacket"
      />
      <img
        v-if="redPacketInfo && redPacketInfo.avatar"
        :src="redPacketInfo.avatar || ''"
        alt=""
        class="vhsaas-red-packet-avatar"
      />
      <img v-else src="../images/avatar_default@2x.png" alt="" class="vhsaas-red-packet-avatar" />
      <p class="vhsaas-red-packet-sender">
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
        //用户未登录
        if (this.userId == 0) {
          return this.$emit('needLogin');
        }
        const available = this.redPacketServer.state.available; // 是否可参与开红包
        console.log('available', available);
        // 获取当前红包状态..抢领取失败, 不可领取, 请求异常调用
        const getStatus = () => {
          this.redPacketServer.getCodeRedPacketInfo(this.redPacketInfo.red_packet_uuid).then(() => {
            this.opened = true;
            const st = setTimeout(() => {
              clearTimeout(st);
              this.$emit('navTo', 'RedPacketSuccess');
            }, 1000);
          });
        };
        this.opening = true; // 打开中
        this.redPacketServer
          .openCodeRedPacket()
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
        // 更新领取后的状态
        this.redPacketServer.setAvailable(false);
        this.redPacketServer.setDotVisible(false);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    width: 453px;
    height: 407px;
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 21;
    &.close {
      background: url(../images/close-bg@2x.png);
      background-size: 100% 100%;
    }
  }
  .vhsaas-close-open {
    width: 72px;
    height: 80px;
    cursor: pointer;
    &.scale {
      -webkit-animation: scaleDraw 1.3s ease-in-out infinite;
      -ms-animation: scaleDraw 1.3s ease-in-out infinite;
      animation: scaleDraw 1.3s ease-in-out infinite;
    }
    @keyframes scaleDraw {
      0% {
        transform: scale(1); /*开始为原始大小*/
      }
      25% {
        transform: scale(0.7); /*缩小为0.75倍*/
      }
      50% {
        transform: scale(1);
      }
      75% {
        transform: scale(0.7);
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
    top: 130px;
    text-align: center;
    width: 100%;
    left: 0;
    .vhsaas-red-packet-sender {
      font-size: 14px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 20px;
      margin-top: 4px;
    }
    .vhsaas-red-packet-avatar {
      display: block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      margin: 78px auto 0 auto;
    }
  }
</style>
