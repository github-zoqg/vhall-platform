<template>
  <div class="vmp-pc-reward-effect-full-screen" v-show="showEffectStatus">
    <SvgaPlayer v-show="isSvga" ref="svgaPlayer" class="player-zone" @finish="finishedPlay" />
    <ImgPlayer v-show="!isSvga" ref="gifPlayer" @finish="finishedPlay" />
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useGiftsServer,
    useWatchRewardServer,
    useMenuServer
  } from 'middle-domain';
  import SvgaPlayer from './svga-player';
  import ImgPlayer from './img-player';
  import TaskQueue from './taskQueue';
  // import { uuid } from '@/app-shared/utils/tool';

  export default {
    name: 'VmpPcRewardEffectFullScreen',
    data() {
      return {
        //是否屏蔽特效
        hideEffect: sessionStorage.getItem('filterStatus_isShieldingEffects') == 'true',
        showEffectStatus: false,
        taskQueue: null, // 飘窗列队
        isSvga: true
      };
    },
    components: {
      SvgaPlayer,
      ImgPlayer
    },
    computed: {
      watchInitData() {
        return this.roomBaseServer.state.watchInitData;
      }
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.watchRewardServer = useWatchRewardServer();
      this.giftsServer = useGiftsServer();
      this.menuServer = useMenuServer();
      console.log('wap this.roomBaseServer------->', this.roomBaseServer);
      this.listenServer();
    },

    mounted() {
      /**
       * 初始化礼物动画队列
       */
      this.taskQueue = new TaskQueue({
        minTaskTime: 5000
      });

      /*  //测试数据
      setTimeout(() => {
        this.addRewardEffect({
          uv: 2,
          data: {
            type: 'reward_pay_ok',
            room_id: 'lss_726c98ec',
            gift_user_id: '1044042222',
            gift_user_nickname: '邵永凯邵永凯邵永凯邵永凯',
            reward_describe: '一二三四五一二三四五一二三四五',
            gift_user_avatar: null,
            gift_user_name: null,
            gift_name: '打赏',
            gift_price: 0,
            gift_image_url:
              'https://t-alistatic01.e.vhall.com/upload/interacts/gift-imgs/5e/4b/5e4b58727b6525b8fd7a9500ff8b1b5a.png',
            gift_id: 134518,
            gift_receiver_id: '100890',
            gift_creator_id: '0',
            source_status: '1'
          },
          msg_source: 'prefix01',
          pv: 2,
          channel: 'ch_527661Qi',
          sender_id: '104404666',
          service_type: 'service_room',
          bu: '1',
          date_time: '2022-06-19 17:22:19',
          context: { nick_name: '', avatar: '' },
          msg_id: 'msg_9df5c8e83a5846ceb79d011a81acacc3' + uuid(),
          app_id: 'fd8d3653'
        });
      }, 3000); */
    },
    methods: {
      // 监听domain层服务消息
      listenServer() {
        this.giftsServer.$on('gift_send_success', msg => {
          console.log('VmpWapRewardEffect--gift_send_success------>', JSON.stringify(msg));
          !this.hideEffect && this.addRewardEffect(msg);
        });
        // 打赏消息
        this.watchRewardServer.$on('reward_pay_ok', rawMsg => {
          /*
          {"msg_id":"msg_89049cca2048c18b749bb681d0f0cea5","app_id":"fd8d3653","channel":"ch_b7c460c6","service_type":"service_room","data":{"type":"reward_pay_ok","room_id":"lss_d6821522","reward_receiver_id":"131458","reward_describe":"恶趣味企鹅","reward_amount":0.01,"reward_count":7,"rewarder_id":"131458","rewarder_nickname":"xs","rewarder_avatar":"https://t-alistatic01.e.vhall.com/upload/users/face-imgs/51/51/515180e3754987ed2cbfb65b1ec292d2.jpeg"},"date_time":"2022-05-19 11:32:07","sender_id":"","context":{"nick_name":"","avatar":""},"bu":"1","tag":"high","msg_source":"prefix01","pv":4,"uv":3}
          */
          console.log('VmpWapRewardEffect--reward_pay_ok------>', JSON.stringify(rawMsg));
          !this.hideEffect && this.addRewardEffect(rawMsg);
        });
        // 自定义菜单服务事件监听
        this.menuServer.$on('tab-switched', data => {
          console.log('wap tab-switched------>', this.cuid, data);
          /**
           * { cuid, menuId }
           * 如果当前tab 激活的是聊天
           */
          if (this.cuid == 'comPcRewardEffectFullScreen' && data.type == 3) {
            this.showEffectStatus = true;
          } else {
            this.showEffectStatus = false;
          }
        });
      },
      //设置是否屏蔽特效
      setHideEffect(status) {
        this.hideEffect = status;
      },
      /**
       * 根据消息里的sender_id判断, 是否是自己发送的
       */
      isSelfByMsgSenderId(sender_id) {
        if (this.watchInitData.join_info.third_party_user_id == sender_id) {
          return true;
        } else {
          return false;
        }
      },
      /**
       * 开始播放效果
       */
      async startPlay(reload) {
        this.showEffectStatus = true;
        this.visible = true;
        let compontent;
        // 自定义礼物
        if (reload.data.source_status == 1 && reload.data.type !== 'reward_pay_ok') {
          compontent = this.$refs.gifPlayer;
          this.isSvga = false;
        } else {
          compontent = this.$refs.svgaPlayer;
          this.isSvga = true;
        }

        console.time('startPlay');
        await compontent.startPlay(reload);
        console.timeEnd('startPlay');
      },
      /**
       * 移除对应的效果
       */
      finishedPlay() {
        this.showEffectStatus = false;
      },
      addRewardEffect(msg) {
        // 添加到队列
        // 构建好任务执行的函数
        const taskFunc = this.startPlay.bind(this, msg);
        this.taskQueue.addTask({
          money: msg.data.gift_price,
          isSelf: this.isSelfByMsgSenderId(msg.sender_id),
          taskFunc
        });
      }
    },
    destroy() {
      console.log('VmpPcRewardEffectFullScreen 组件销毁');
    }
  };
</script>

<style lang="less">
  // 飘屏
  .vmp-pc-reward-effect-full-screen {
    position: absolute;
    left: 0;
    bottom: 100px;
    width: 100%;
    height: 50%;
    pointer-events: none;
    z-index: 300;
    .player-zone {
      width: 100%;
      height: 100%;
    }
  }
</style>
