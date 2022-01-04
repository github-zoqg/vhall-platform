<template>
  <div v-show="isShow" class="vmp-chat-emoji">
    <img
      v-for="item in emojiList"
      :key="item.value"
      class="vmp-chat-emoji__img"
      width="24"
      height="24"
      :src="item.src"
      @click="selectEmoji(item)"
    />
  </div>
</template>
<script>
  import { getEmojiList } from '../js/emoji';
  export default {
    name: 'VmpChatEmoji',
    data() {
      return {
        isShow: false,
        emojiList: []
      };
    },
    created() {
      this.emojiList = getEmojiList();
    },
    mounted() {
      document.addEventListener('click', () => {
        this.isShow = false;
      });
    },
    methods: {
      toggleShow() {
        this.isShow = !this.isShow;
      },
      selectEmoji(item) {
        this.$emit('emojiInput', item.name);
      }
    }
  };
</script>
<style lang="less">
  .vmp-chat-emoji {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    background: #f7f7f7;
    padding: 6px;
    border: 1px #afafaf solid;
    border-radius: 4px;
    &__img {
      width: 24px;
      height: 24px;
      padding: 2px;
      display: block;
      box-sizing: border-box;
      cursor: pointer;
      &:hover {
        border-radius: 2px;
        background-color: #e7e7e7;
      }
    }
  }
</style>
