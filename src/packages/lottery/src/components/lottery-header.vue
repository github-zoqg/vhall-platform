<template>
  <div class="lottery-header">
    <div
      class="custom-lottery-box"
      :class="!prizeInfo.award_name ? 'custom-lottery-box-default' : ''"
    >
      <img
        v-if="!prizeInfo.image_url"
        src="../img/default-lottery.png"
        alt=""
        class="default-lottery"
      />
      <div v-else class="custom-lottery">
        <img :src="prizeInfo.image_url" alt="" />
      </div>
      <p
        v-show="prizeInfo.award_name || isShowDefault"
        class="custom-lottery__name"
        :class="!prizeInfo.award_name ? 'custom-lottery__name-default' : ''"
      >
        {{ prizeInfo.award_name || $t('interact_tools.interact_tools_1009') }}
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      prizeInfo: {
        type: Object,
        default() {
          return {};
        }
      },
      isShowDefault: {
        type: Boolean,
        default() {
          return false;
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .lottery-header {
    margin-top: 82px;
    .custom-lottery-box {
      width: 106px;
      height: 106px;
      position: relative;
      &-default {
        width: 120px;
      }
      .custom-lottery {
        width: 100px;
        height: 100px;
        border-radius: 60px;
        overflow: hidden;
        background-color: #ffc95e;
        border: 3px solid #ffc95e;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .custom-lottery__name {
        position: absolute;
        top: 79px;
        background-color: #ff962e;
        border-radius: 16px;
        line-height: 30px;
        padding: 0 13px;
        white-space: nowrap;
        margin-left: 50%;
        transform: translate(-50%, 0);
        color: #ffffff;
        font-size: 16px;
        &-default {
          top: 88px;
        }
      }
    }
    .custom-lottery__default-name {
      position: absolute;
      top: 79px;
      background-color: #ff962e;
      border-radius: 16px;
      line-height: 30px;
      padding: 0 13px;
      white-space: nowrap;
      margin-left: 50%;
      transform: translate(-50%, 0);
      color: #ffffff;
      font-size: 16px;
    }
  }
</style>
