<template>
  <div class="vmp-wap-reward-effect" v-if="showEffectStatus">
    <transition-group name="right-left">
      <div
        v-for="rewardEffectInfo in rewardEffectList"
        v-bind:key="rewardEffectInfo.msg_id"
        class="reward-effect-box default"
        :class="{
          // 打赏动效背景class
          'bg-red-package': rewardEffectInfo.data.type != 'gift_send_success',
          // 默认礼物的背景class
          [effectsMap[rewardEffectInfo.data.gift_name] || 'bg-custom']:
            rewardEffectInfo.data.type == 'gift_send_success'
        }"
      >
        <div class="content">
          <!-- <span class="money-img cover-img" v-if="rewardEffectInfo.type == 'reward'"></span> -->
          <span class="nick-name">
            {{ gift_user_nickname(rewardEffectInfo) | overHidden(7) }}
          </span>
          <!-- <span v-if="rewardEffectInfo.type == 'reward'">
            打赏
            <span class="money">{{ rewardEffectInfo.gift_price }}</span>
            元
          </span> -->
          <span
            class="gift-name"
            v-if="
              rewardEffectInfo.data.type == 'gift_send_success' ||
              rewardEffectInfo.data.event_type == 'free_gift_send'
            "
          >
            <!-- 礼物标题 -->
            送出{{ rewardEffectInfo.data.gift_name | overHidden(8) }}
            <!-- <span class="count">
              <span class="multiple">x</span>
              {{ rewardEffectInfo.num }}
            </span> -->
          </span>
          <span class="gift-name" v-if="rewardEffectInfo.data.type == 'reward_pay_ok'">
            {{ rewardEffectInfo.data.reward_describe }}
          </span>
          <div
            v-if="
              rewardEffectInfo.data.type == 'gift_send_success' ||
              rewardEffectInfo.data.event_type == 'free_gift_send'
            "
            class="gift-img"
          >
            <img
              :class="rewardEffectInfo.data.source_status == 1 ? 'zdy-gigt-img' : ''"
              :src="
                (rewardEffectInfo.data.gift_image_url || rewardEffectInfo.data.gift_url) +
                '?x-oss-process=image/resize,m_lfit,w_100'
              "
              alt=""
            />
          </div>
          <img
            src="./images/red-package-1.png"
            alt=""
            class="gift-img red-package"
            v-else-if="rewardEffectInfo.data.type == 'reward_pay_ok'"
          />
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useGiftsServer,
    useWatchRewardServer,
    useMenuServer
  } from 'middle-domain';
  import TaskQueue from './taskQueue';
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  import { uuid } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'VmpWapRewardEffect',
    data() {
      return {
        effectsMap: {
          鲜花: 'bg-flower',
          咖啡: 'bg-coffee',
          赞: 'bg-praise',
          鼓掌: 'bg-applause',
          666: 'bg-666'
          // 'bg-custom': 'bg-custom' //用户自定义礼物
        },
        //是否屏蔽特效
        hideEffect: false,
        rewardEffectList: [],
        showEffectStatus: false,
        taskQueue: null // 飘窗列队
      };
    },
    computed: {
      watchInitData() {
        return this.roomBaseServer.state.watchInitData;
      },
      // 用户头像
      default_user_avatar() {
        return defaultAvatar;
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
        minTaskTime: 222000,
        maxQueueLen: 2
      });

      //测试数据

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
          gift_name: '666',
          gift_price: 0,
          gift_image_url:
            'https://t-alistatic01.e.vhall.com/upload/interacts/gift-imgs/5e/4b/5e4b58727b6525b8fd7a9500ff8b1b5a.png',
          gift_id: 134518,
          gift_receiver_id: '100890',
          gift_creator_id: '0',
          source_status: '0'
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
    },
    methods: {
      // 监听domain层服务消息
      listenServer() {
        this.giftsServer.$on('gift_send_success', msg => {
          !this.hideEffect && this.addRewardEffect(msg);
        });
        // 打赏消息
        this.watchRewardServer.$on('reward_pay_ok', rawMsg => {
          !this.hideEffect && this.addRewardEffect(rawMsg);
        });
        // 自定义菜单服务事件监听
        this.menuServer.$on('tab-switched', data => {
          console.log('wap tab-switched------>', this.cuid, data);
          /**
           * { cuid, menuId }
           * 如果当前tab 激活的是聊天
           */
          if (this.cuid == 'comWapRewardEffect' && data.type == 3) {
            this.showEffectStatus = true;
          } else {
            this.showEffectStatus = false;
          }
        });
      },
      // 用户昵称
      gift_user_nickname(rewardEffectInfo) {
        if (
          rewardEffectInfo.data.type == 'gift_send_success' ||
          rewardEffectInfo.data.type == 'reward_pay_ok' ||
          rewardEffectInfo.data.event_type == 'free_gift_send'
        ) {
          if (rewardEffectInfo.data.gift_user_nickname) {
            return rewardEffectInfo.data.gift_user_nickname;
          } else if (rewardEffectInfo.data.rewarder_nickname) {
            return rewardEffectInfo.data.rewarder_nickname;
          } else {
            // 默认返回nickname
            return rewardEffectInfo.data.nickname;
          }
        } else {
          return rewardEffectInfo.data.nickname;
        }
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
      playRewardEffect(effect) {
        return new Promise(resolve => {
          this.rewardEffectList.push(effect);
          this.$nextTick(() => {
            resolve();
          });
        });
      },
      /**
       * 移除对应的效果
       */
      removeRewardEffect(effect) {
        return new Promise(resolve => {
          console.log('removeRewardEffect-------->', effect.msg_id);
          this.rewardEffectList.splice(0, 1);
          this.$nextTick(() => {
            resolve();
          });
        });
      },
      addRewardEffect(msg) {
        // 添加到队列
        this.taskQueue.addTask({
          gift_price: msg.data.gift_price,
          isSelf: this.isSelfByMsgSenderId(msg.sender_id),
          playRewardEffect: this.playRewardEffect.bind(this, msg),
          removeRewardEffect: this.removeRewardEffect.bind(this, msg)
        });
      }
    },
    destroy() {
      console.log('VmpWapRewardEffect 组件销毁');
    }
  };
</script>

<style lang="less">
  // 飘屏
  .vmp-wap-reward-effect {
    // .flex();
    position: absolute;
    left: 0;
    top: 40px;
    z-index: 100;
    .reward-effect-box {
      height: 56px;
      width: fit-content;
      position: relative;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      &.default {
        background: linear-gradient(90deg, #8274ff 2.98%, rgba(249, 51, 249, 0.4) 118.57%);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 44px;
        .gift-img {
          background-image: url(images/flower-bg.png);
        }
      }
      &.bg-applause {
        background-image: url(images/applause-bg.png);
      }
      &.bg-coffee {
        background-image: url(images/coffee-bg.png);
      }
      &.bg-custom {
        background: linear-gradient(90deg, #8274ff 2.98%, rgba(249, 51, 249, 0.4) 118.57%);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 44px;
        .gift-img {
          background-image: url(images/flower-bg.png);
        }
      }
      &.bg-flower {
        background: linear-gradient(90deg, #8274ff 2.98%, rgba(249, 51, 249, 0.4) 118.57%);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 44px;
        .gift-img {
          background-image: url(images/flower-bg.png);
        }
      }
      &.bg-praise {
        background-image: url(images/praise-bg.png);
      }
      &.bg-666 {
        background: linear-gradient(90deg, #8274ff 2.98%, rgba(249, 51, 249, 0.4) 118.57%);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        border-radius: 44px;
        .gift-img {
          background-image: url(images/flower-bg.png);
        }
      }
    }
    .content {
      position: relative;
      top: -14px;
      left: 24px;
      display: flex;
      align-items: center;
    }
    .money-img {
      display: inline-block;
      width: 50px;
      height: 50px;
      background-image: url('images/reward-chat.png');
    }

    .gift-img {
      width: 124px;
      height: 83px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      z-index: 10;
      position: relative;
      top: 0;
      right: -6px;
      img {
        width: 98px;
        height: 98px;
        margin-top: -30px;
      }
    }

    .zdy-gigt-img {
      width: 80px;
      height: 80px;
      background-color: white;
      border-radius: 50%;
    }
    .nick-name {
      font-size: 28px;
      font-weight: 500;
      color: #ffffff;
      margin-right: 8px;
    }
    .gift-name {
      font-size: 24px;
      color: #ffffff;
      opacity: 0.8;
    }
    .money,
    .count {
      color: #ffd63b;
    }
    .multiple {
      font-size: 12px;
    }
    .red-package {
      width: 64px;
      height: auto;
    }
  }
</style>
