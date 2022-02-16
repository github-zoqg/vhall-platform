<template>
  <div class="vmp-chat-wap">
    <div class="vmp-chat-wap__content">
      <!-- 如果开启观众手动加载聊天历史配置项，并且聊天列表为空的时候显示加载历史消息按钮 -->
      <p
        v-if="hideChatHistory && !chatList.length"
        class="vmp-chat-wap__content__get-list-btn-container"
      >
        <span @click="getHistoryMessage" class="vmp-chat-wap__content__get-list-btn">
          查看聊天历史消息
        </span>
      </p>
      <scroll ref="scroll" @pullingDown="handlePullingDown">
        <msg-item
          v-for="msg in chatList"
          :key="msg.count"
          :msg="msg"
          @preview="handlePreview"
        ></msg-item>
      </scroll>
      <div
        class="vmp-chat-wap__content__new-msg-tips"
        v-show="messageType.atList || messageType.reply || messageType.normal"
        @click="scrollBottom"
      >
        <span
          v-if="
            (messageType.normal && !messageType.atList && !messageType.reply) ||
            newMsgNum > 1 ||
            !((messageType.atList || messageType.reply) && newMsgNum <= 1 && messageType.noNormal)
          "
        >
          有{{ newMsgNum }}条未读消息
        </span>
        <span
          v-if="(messageType.atList || messageType.reply) && newMsgNum <= 1 && messageType.noNormal"
        >
          有人{{ messageType.atList ? '@' : '' }}{{ messageType.reply ? '回复' : '' }} 你
        </span>
        <i class="iconfont iconxiangxia"></i>
      </div>
    </div>
    <div class="vmp-chat-wap__bottom-area"></div>
  </div>
</template>

<script>
  import scroll from './components/scroll';
  import msgItem from './components/msg-item';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  export default {
    name: 'VmpChatWap',
    components: {
      scroll,
      msgItem
    },
    data() {
      return {
        //todo 聊天列表,接入domain
        chatList: [],
        //新消息信息集合体
        messageType: {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        },
        //新消息数量
        newMsgNum: 0
      };
    },
    computed: {
      //todo domain取
      hideChatHistory() {
        return false;
      }
    },
    beforeCreate() {},
    created() {
      //添加聊天tab
      window.$middleEventSdk?.event?.send(
        boxEventOpitons(this.cuid, 'addTab', {
          comp: 'comChatWap',
          key: 'chatWap',
          text: '聊天'
        })
      );
    },
    mounted() {},
    methods: {
      //todo 获取历史消息记录
      getHistoryMessage() {},
      //todo 图片预览
      handlePreview() {},
      //todo 下拉加载
      handlePullingDown() {},
      //滚动到底部
      scrollBottom() {
        this.$refs.scroll.scrollBottom();
        this.messageType = {
          atList: false,
          reply: false,
          normal: false,
          id: '',
          noNormal: false
        };
        this.newMsgNum = 0;
      }
    }
  };
</script>

<style lang="less">
  .vmp-chat-wap {
    &__content {
      &__get-list-btn-container {
      }
      &__get-list-btn {
      }
      &__new-msg-tips {
      }
    }
  }
</style>
