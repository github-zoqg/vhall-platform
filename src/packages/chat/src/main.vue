<template>
  <div class="c-vmp-chat">
    <!--    欢迎语-->
    <div
      v-if="welcome_vo.welcome_content && welcome_vo.nick_name && !isGreetingHidden"
      class="greeting-box"
      :class="{ opacity0: !isGreetingShow }"
    >
      <div class="greeting-box__content">
        <span class="greeting-box__content--text">{{ welcome_vo.nick_name }}</span>
        {{ welcome_vo.welcome_content }}
      </div>
    </div>
    <!--    聊天消息区域-->

    <!--    聊天操作（表情，过滤等）-->
    <!--    图片预览-->
    <!--    礼物、打赏特效-->
  </div>
</template>

<script>
  export default {
    name: 'VmpChat',
    components: {},
    props: {},
    data() {
      return {
        //欢迎语信息 todo 接口通了清空mock测试数据
        welcome_vo: {
          welcome_content: '欢迎来到直播间',
          nick_name: '张三'
        },
        // 控制欢迎语显示的标识，控制动画
        isGreetingShow: true,
        // 控制欢迎语显示的标识，控制 dom
        isGreetingHidden: false
      };
    },
    computed: {},
    beforeCreate() {},
    created() {},
    destroyed() {},
    methods: {}
  };
</script>

<style scoped lang="less">
  .c-vmp-chat {
    width: 100%;
    height: 100%;
    position: relative;
    //background: @bg-dark-section;
    /* 欢迎语样式开始 */
    .greeting-box {
      width: 100%;
      display: flex;
      justify-content: center;
      position: absolute;
      top: 5px;
      transition: all 1s ease;
      z-index: 1;

      &.opacity0 {
        opacity: 0;
      }

      &__content {
        max-width: 312px;
        background: linear-gradient(90deg, #fb3a32 0%, rgba(255, 172, 44, 0.8) 100%);
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        border-radius: 999999px;
        color: #ffffff;
        font-size: 14px;
        line-height: 20px;
        padding: 6px 16px;
        text-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      &__content--text {
        display: inline-block;
        max-width: 126px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        word-break: break-all;
        vertical-align: top;
      }
    }
    /* 欢迎语样式结束 */
  }
</style>
