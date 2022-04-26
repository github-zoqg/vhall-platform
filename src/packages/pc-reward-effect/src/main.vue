<template>
  <div class="vmp-reward-effect">
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
    useWatchRewardServer
  } from 'middle-domain';
  import TaskQueue from './taskQueue';
  import { uuid } from '@/packages/app-shared/utils/tool';

  export default {
    name: 'VmpPcRewardEffect',
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
        // rewardEffectInfo: null,
        taskQueue: null // 飘窗列队
      };
    },
    computed: {
      watchInitData() {
        return this.roomBaseServer.state.watchInitData;
      },
      // 默认用户头像
      default_user_avatar() {
        return require('./images/default_avatar.png');
      }
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.watchRewardServer = useWatchRewardServer();
      this.giftsServer = useGiftsServer();
      this.chatServer = useChatServer();
      console.log('wap this.roomBaseServer------->', this.roomBaseServer);
      this.listenServer();
    },

    mounted() {
      /**
       * 初始化礼物动画队列
       */
      this.taskQueue = new TaskQueue({
        minTaskTime: 2000,
        maxQueueLen: 3
      });

      // let i = 0;
      // setInterval(() => {
      //   this.watchRewardServer.$emit('reward_pay_ok', {
      //     app_id: 'fd8d3653',
      //     bu: '1',
      //     channel: 'ch_qT76A13e',
      //     date_time: '2022-03-10 10:15:37',
      //     msg_id: 'msg_8f1218c9470f4aa6bc188d53dc22732c' + i++,
      //     msg_source: 'prefix01',
      //     pv: 3,
      //     sender_id: '18200089',
      //     service_type: 'service_room',
      //     context: {},
      //     data: {
      //       reward_amount: 0.01,
      //       reward_count: 32,
      //       reward_describe: '很精彩，赞一个～～',
      //       reward_receiver_id: '18200089',
      //       rewarder_avatar:
      //         'https://t-alistatic01.e.vhall.com/upload/user/avatar/2021/09/28/6152add62adaa.jpg',
      //       rewarder_id: '100483',
      //       rewarder_nickname: '天',
      //       room_id: 'lss_e5bc797c',
      //       type: 'reward_pay_ok'
      //     },
      //     uv: 3
      //   });
      // }, 500);

      //测试数据
      // setInterval(() => {
      //   this.addRewardEffect({
      //     uv: 2,
      //     data: {
      //       type: 'gift_send_success',
      //       room_id: 'lss_726c98ec',
      //       gift_user_id: '1044042222',
      //       gift_user_nickname: 'v邵永凯11111' + uuid(),
      //       gift_user_avatar: null,
      //       gift_user_name: null,
      //       gift_name: '666',
      //       gift_price: 0,
      //       gift_image_url:
      //         'https://t-alistatic01.e.vhall.com/upload/interacts/gift-imgs/5e/4b/5e4b58727b6525b8fd7a9500ff8b1b5a.png',
      //       gift_id: 134518,
      //       gift_receiver_id: '100890',
      //       gift_creator_id: '0',
      //       source_status: '0'
      //     },
      //     msg_source: 'prefix01',
      //     pv: 2,
      //     channel: 'ch_527661Qi',
      //     sender_id: '104404666333',
      //     service_type: 'service_room',
      //     bu: '1',
      //     date_time: '2022-02-19 17:22:19',
      //     context: { nick_name: '', avatar: '' },
      //     msg_id: 'msg_9df5c8e83a5846ceb79d011a81acacc3' + uuid(),
      //     app_id: 'fd8d3653'
      //   });
      // }, 100);
    },
    methods: {
      // 监听domain层服务消息
      listenServer() {
        this.giftsServer.$on('gift_send_success', msg => {
          console.log('VmpWapRewardEffect-------->', msg);
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
            this.$message({
              message: this.$t('common.common_1005'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
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
          if (rewardEffectInfo.data.avatar) {
            return rewardEffectInfo.data.avatar;
          } else if (rewardEffectInfo.data.gift_user_avatar) {
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
  .vmp-reward-effect {
    position: absolute;
    overflow: hidden;
    left: 16px;
    top: 60px;
    z-index: 100;
    .reward-effect-box {
      width: 234px;
      height: 54px;
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
        width: 40px;
        height: 40px;
        position: absolute;
        left: 4px;
        bottom: 4px;
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
      width: 78px;
      height: 56px;
      position: absolute;
      right: 11px;
      bottom: 11px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      z-index: 10;
    }
    .zdy-gigt-img {
      width: 42px;
      height: 42px;
      background-color: white;
      border-radius: 50%;
    }
    .nick-name {
      width: 252px;
      height: 28px;
      font-size: 14px;
      // font-weight: 500;
      color: #ffffff;
      line-height: 28px;
      position: absolute;
      top: 7px;
      left: 55px;
    }
    .gift-name {
      width: 216px;
      height: 24px;
      font-size: 14px;
      color: #ffffff;
      line-height: 24px;
      position: absolute;
      top: 27px;
      left: 55px;
      opacity: 0.8;
      // .ellipsis();
      // .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // }
    }
    .money,
    .count {
      color: #ffd63b;
    }
    .multiple {
      font-size: 12px;
    }
    .red-package {
      width: 32px;
      height: auto;
      top: -2px;
      right: 16px;
    }
  }
</style>
