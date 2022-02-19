<template>
  <div class="vmp-wap-reward-effect">
    <transition name="right-left">
      <template v-if="rewardEffectInfo">
        <div class="reward-effect-box">
          <span class="money-img cover-img" v-if="rewardEffectInfo.type == 'reward'"></span>
          <span
            class="gift-img cover-img"
            v-if="rewardEffectInfo.type == 'gift'"
            :class="{
              custom: rewardEffectInfo.system_status != 0,
              'cover-img': rewardEffectInfo.system_status == '0',
              'contain-img': rewardEffectInfo.system_status != '0'
            }"
            :style="{
              backgroundImage: `url(${$imgHost}/${rewardEffectInfo.image_url}?x-oss-process=image/resize,m_lfit,w_100)`
            }"
          ></span>
          <span class="nick_name">{{ rewardEffectInfo.nickname | overHidden(7) }}</span>
          <span v-if="rewardEffectInfo.type == 'reward'">
            打赏
            <span class="money">{{ rewardEffectInfo.money }}</span>
            元
          </span>
          <span v-if="rewardEffectInfo.type == 'gift'">
            赠送{{ rewardEffectInfo.name }}
            <span class="count">
              <span class="multiple">x</span>
              {{ rewardEffectInfo.num }}
            </span>
          </span>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';
  import TaskQueue from './taskQueue';

  export default {
    name: 'VmpWapRewardEffect',
    data() {
      return {
        rewardEffectInfo: null,
        taskQueue: null // 飘窗列队
      };
    },
    computed: {},
    created() {
      this.roomBaseServer = useRoomBaseServer();
      console.log('wap this.roomBaseServer------->', this.roomBaseServer);
    },
    methods: {
      async playRewardEffect(effect) {
        const palyFunc = async () => {
          if (typeof effect === 'string') {
            effect = JSON.parse(effect);
          }
          this.rewardEffectInfo = effect;
          const st = setTimeout(() => {
            clearTimeout(st);
            this.rewardEffectInfo = null;
          }, 2000);
        };
        await palyFunc();
      },
      addRewardEffect(content) {
        const taskFunc = this.playRewardEffect.bind(this, content);
        // 添加到队列
        this.taskQueue.addTask({
          moeny: content.moeny,
          isSelf: content.isSelf,
          taskFunc
        });
      }
    },
    mounted() {
      /**
       * 初始化礼物动画队列
       */
      this.taskQueue = new TaskQueue({
        minTaskTime: 3000
      });
    }
  };
</script>
