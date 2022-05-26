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
        <!-- <span class="money-img cover-img" v-if="rewardEffectInfo.type == 'reward'"></span> -->
        <img class="gift-user-avatar" :src="gift_user_avatar(rewardEffectInfo)" />
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
          送出{{ rewardEffectInfo.data.gift_name }}
          <!-- <span class="count">
              <span class="multiple">x</span>
              {{ rewardEffectInfo.num }}
            </span> -->
        </span>
        <span class="gift-name" v-if="rewardEffectInfo.data.type == 'reward_pay_ok'">
          {{ rewardEffectInfo.data.reward_describe | overHidden(8) }}
        </span>
        <span
          v-if="
            rewardEffectInfo.data.type == 'gift_send_success' ||
            rewardEffectInfo.data.event_type == 'free_gift_send'
          "
          class="gift-img"
          :class="rewardEffectInfo.data.source_status == 1 ? 'zdy-gigt-img' : ''"
          :style="{
            backgroundImage: `url(${
              rewardEffectInfo.data.gift_image_url || rewardEffectInfo.data.gift_url
            }?x-oss-process=image/resize,m_lfit,w_100)`
          }"
        ></span>
        <img
          src="./images/red-package-1.png"
          alt=""
          class="gift-img red-package"
          v-else-if="rewardEffectInfo.data.type == 'reward_pay_ok'"
        />
      </div>
    </transition-group>
  </div>
</template>

<script>
  import {
    useRoomBaseServer,
    useGiftsServer,
    useChatServer,
    useWatchRewardServer,
    useMenuServer
  } from 'middle-domain';
  import TaskQueue from './taskQueue';
  import defaultAvatar from '@/packages/app-shared/assets/img/default_avatar.png';
  // import { uuid } from '@/packages/app-shared/utils/tool';

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
        showEffectStatus: false, //是否显示礼物动画, 如果当前tab为聊天时才显示
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
      this.chatServer = useChatServer();
      this.menuServer = useMenuServer();
      this.listenServer();
    },

    mounted() {
      /**
       * 初始化礼物动画队列
       */
      this.taskQueue = new TaskQueue({
        minTaskTime: 2000,
        maxQueueLen: 2
      });

      //测试数据
      /*
      setInterval(() => {
        this.addRewardEffect({
          uv: 2,
          data: {
            type: 'gift_send_success',
            room_id: 'lss_726c98ec',
            gift_user_id: '1044042222',
            gift_user_nickname: 'v邵永凯11111',
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
          date_time: '2022-02-19 17:22:19',
          context: { nick_name: '', avatar: '' },
          msg_id: 'msg_9df5c8e83a5846ceb79d011a81acacc3' + uuid(),
          app_id: 'fd8d3653'
        });
      }, 100);
      */
    },
    methods: {
      // 监听domain层服务消息
      listenServer() {
        this.giftsServer.$on('gift_send_success', msg => {
          console.log('VmpWapRewardEffect-------->', JSON.stringify(msg));
          const nickname = msg.data.gift_user_nickname || msg.data.nickname;
          const data = {
            nickname: nickname.length > 8 ? nickname.substr(0, 8) + '...' : nickname,
            avatar: msg.data.avatar,
            content: {
              gift_name: msg.data.gift_name,
              gift_url: `${msg.data.gift_image_url || msg.data.gift_url}`,
              source_status: msg.data.source_status
            },
            type: 'gift_send_success',
            interactToolsStatus: true
          };
          this.chatServer.addChatToList(data);
          !this.hideEffect && this.addRewardEffect(msg);
        });
        // 打赏消息
        this.watchRewardServer.$on('reward_pay_ok', rawMsg => {
          // 添加聊天消息
          const data = {
            avatar: rawMsg.data.rewarder_avatar,
            nickname:
              rawMsg.data.rewarder_nickname.length > 8
                ? rawMsg.data.rewarder_nickname.substr(0, 8) + '...'
                : rawMsg.data.rewarder_nickname,
            type: 'reward_pay_ok',
            content: {
              text_content: rawMsg.data.reward_describe
                ? rawMsg.data.reward_describe
                : this.$t('chat.chat_1037'),
              num: rawMsg.data.reward_amount
            },
            sendId: this.roomBaseServer.state.watchInitData.join_info.third_party_user_id,
            roleName: this.roleName,
            interactToolsStatus: true
          };
          this.chatServer.addChatToList(data);
          !this.hideEffect && this.addRewardEffect(rawMsg);

          if (
            this.roomBaseServer.state.watchInitData.join_info.third_party_user_id ==
            rawMsg.data.rewarder_id
          ) {
            this.closeDialog();
            this.$message({
              message: this.$t('common.common_1005'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
          }
        });
        // 自定义菜单服务事件监听
        this.menuServer.$on('tab-switched', data => {
          console.log('reward-effect tab-switched------>', this.cuid, data);
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
      // 礼物用户头像
      gift_user_avatar(rewardEffectInfo) {
        console.log('gift_user_avatar------>', rewardEffectInfo);
        if (
          rewardEffectInfo.data.type == 'gift_send_success' ||
          rewardEffectInfo.data.type == 'reward_pay_ok' ||
          rewardEffectInfo.data.event_type == 'free_gift_send'
        ) {
          // 来源于接口消息字段
          if (rewardEffectInfo.data.gift_user_avatar) {
            return rewardEffectInfo.data.gift_user_avatar;
          } else if (rewardEffectInfo.data.rewarder_avatar) {
            return rewardEffectInfo.data.rewarder_avatar;
          } else {
            return this.default_user_avatar;
          }
        } else {
          return this.default_user_avatar;
        }
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
    left: 16px;
    top: 620px;
    z-index: 100;
    .reward-effect-box {
      width: 480px;
      height: 110px;
      position: relative;
      background-size: 100%;
      background-repeat: no-repeat;
      &.default {
        background-image: url(images/red-package-bg.png);
      }
      &.bg-applause {
        background-image: url(images/applause-bg.png);
      }
      &.bg-coffee {
        background-image: url(images/coffee-bg.png);
      }
      &.bg-custom {
        background-image: url(images/custom-bg.png);
      }
      &.bg-flower {
        background-image: url(images/flower-bg.png);
      }
      &.bg-praise {
        background-image: url(images/praise-bg.png);
      }
      &.bg-666 {
        background-image: url(images/666-bg.png);
      }
      .gift-user-avatar {
        width: 80px;
        height: 80px;
        position: absolute;
        left: 4px;
        bottom: 4px;
        background: white;
        border-radius: 50%;
        overflow: hidden;
      }
    }
    .money-img {
      display: inline-block;
      width: 50px;
      height: 50px;
      background-image: url('images/reward-chat.png');
    }

    .gift-img {
      width: 140px;
      height: 140px;
      position: absolute;
      right: 0;
      bottom: 0;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      z-index: 10;
    }

    .zdy-gigt-img {
      width: 80px;
      height: 80px;
      background-color: white;
      border-radius: 50%;
      top: -10px;
      right: 20px;
    }
    .nick-name {
      width: 252px;
      height: 28px;
      font-size: 28px;
      font-weight: 500;
      color: #ffffff;
      line-height: 28px;
      position: absolute;
      top: 30px;
      left: 100px;
    }
    .gift-name {
      width: 216px;
      height: 24px;
      font-size: 24px;
      color: #ffffff;
      line-height: 24px;
      position: absolute;
      top: 70px;
      left: 100px;
      opacity: 0.8;
      .ellipsis();
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
      top: -2px;
      right: 32px;
    }
  }
</style>
