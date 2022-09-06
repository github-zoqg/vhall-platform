<template>
  <div v-show="isShow" ref="emojiBox" class="vmp-chat-emoji">
    <el-image
      v-for="item in emojiList"
      :key="item.value + rand"
      class="vmp-chat-emoji__img"
      width="24"
      height="24"
      :src="item.src"
      @click="selectEmoji(item)"
      lazy
    ></el-image>
  </div>
</template>
<script>
  import { getEmojiList } from '../js/emoji';
  export default {
    name: 'VmpChatEmoji',
    data() {
      return {
        isShow: false,
        emojiList: [],
        rand: '' //随机数，用于改变img的key,使对话框显示的时候能够加载img
      };
    },
    created() {
      this.emojiList = getEmojiList();
    },
    mounted() {
      document.addEventListener('click', this.closeModal);
    },
    beforeDestroy() {
      document.removeEventListener('click', this.closeModal);
    },
    methods: {
      //关闭表情模态窗
      closeModal() {
        this.isShow = false;
      },
      //切换表情模态窗显示
      toggleShow() {
        this.isShow = !this.isShow;
        if (this.isShow && this.emojiList.length) {
          if (!this.rand) {
            // 首次展示对话框的时候加载表情图片
            this.rand = (Math.random() * 10000000).toFixed(0);
          } else {
            const len = this.$refs['emojiBox'].getElementsByTagName('img').length;
            // 表情图片未加载，或未全部加载，需要触发重新加载
            if (len === 0 || len < this.emojiList.length) {
              this.rand = (Math.random() * 10000000).toFixed(0);
            }
          }
        }
      },
      //选中了表情的处理
      selectEmoji(item) {
        this.$emit('emojiInput', item.name);
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-emoji {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    background: #f7f7f7;
    padding: 2px;
    border: 1px #afafaf solid;
    border-radius: 4px;
    overflow: auto;
    &__img {
      width: 24px;
      height: 24px;
      display: block;
      cursor: pointer;
      &:hover {
        border-radius: 2px;
        background-color: #e7e7e7;
      }
    }
  }
</style>
