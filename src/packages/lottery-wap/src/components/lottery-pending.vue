<template>
  <div class="vmp-lottery-pending">
    <!-- 自定义图片的抽奖样式 -->
    <LotteryPendingCustom
      v-if="isCustom"
      :needJoin="needJoin"
      :fitment="fitment"
      @joinLottery="joinLottery"
    />
    <!-- 自定义图片的抽奖样式 -->
    <div v-else>
      <div id="lottery-svga"></div>
    </div>
  </div>
</template>
<script>
  import LotteryPendingCustom from './lottery-pending-custom.vue';
  import props from './props';
  import { useChatServer } from 'middle-domain';
  import SVGA from 'svgaplayerweb';
  let player, parser;

  export default {
    name: 'LotteryPending',
    inject: ['lotteryServer'],
    mixins: [props],
    components: {
      LotteryPendingCustom
    },
    computed: {
      isCustom() {
        return this.fitment.img_order === 0;
      },
      // 显示
      needJoin() {
        return (
          this.lotteryInfo.lottery_type == 8 &&
          this.lotteryInfo.submit_command !== 1 &&
          !this.joined
        );
      },
      // 口令抽奖是否需要登录状态
      needLoginStatus() {
        if (this.configList && this.configList['ui.show_chat_without_login'] == '0') {
          //
          if (this.joinUserId !== 0 || this.isEmbed) {
            // 当前为嵌入页或已登录
            return false;
          } else {
            return true;
          }
        } else {
          // 配置了聊天免登录
          return false;
        }
      },
      // 是否是嵌入页
      isEmbed() {
        return this.$domainStore.state?.roomBaseServer?.embedObj?.embed;
      },
      // 房间配置
      configList() {
        return this.$domainStore.state?.roomBaseServer?.configList;
      },
      // 参会id(识别登录状态)
      joinUserId() {
        return this.$domainStore.state?.roomBaseServer?.watchInitData?.join_info?.user_id;
      }
    },
    data() {
      return {
        loading: false,
        joined: false
      };
    },
    mounted() {
      if (this.fitment.img_order !== 0) {
        this.initSvgaResource();
      }
    },
    methods: {
      // 发送口令
      joinLottery() {
        if (this.needLoginStatus) {
          return this.$emit('needLogin');
        }
        if (this.loading || this.joined) return;
        this.loading = true;
        this.lotteryServer
          .joinLottery(this.lotteryId || this.lotteryInfo.id || this.lotteryInfo.lottery_id)
          .then(res => {
            if (res.code === 200) {
              const msg = useChatServer().createCurMsg();
              msg.setText(this.lotteryInfo.command);
              useChatServer().sendMsg(msg);
              this.joined = true;
              this.$toast(this.$t('chat.chat_1010'));
            }
          })
          .finally(() => {
            this.loading = false;
          });
      },
      initSvgaResource() {
        player = new SVGA.Player('#lottery-svga');
        parser = new SVGA.Parser('#lottery-svga');
        const url =
          'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-capsule.svga';
        // const url =
        //   'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-turnplate.svga';
        // const url =
        //   'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/lottery/lottery-slotmachine.svga';
        const imgUrl =
          'https://t-vhallsaas-static.oss-cn-beijing.aliyuncs.com/common-static/svga/test/send.png';
        parser.load(url, function (videoItem) {
          player.setVideoItem(videoItem);
          player.setImage(imgUrl, 'img_21117');
          player.startAnimationWithRange({
            location: 30,
            length: 60
          });
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-lottery-pending {
    #lottery-svga {
      overflow: hidden;
      width: 750px;
      height: 750px;
      background: red;
    }
  }
</style>
