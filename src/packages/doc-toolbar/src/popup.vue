<template>
  <div class="vmp-brush-popup">
    <div class="list-container">
      <div class="item-list">
        <slot name="item"></slot>
      </div>
      <div class="color-list">
        <slot name="color"></slot>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpBrushPopup'
  };
</script>
<style lang="less">
  .vmp-brush-popup {
    display: none;
    position: absolute;
    top: 36px;
    left: 0;
    padding-top: 4px;

    .list-container {
      width: 129px;
      background: rgba(0, 0, 0, 0.59);
      border-radius: 4px;
      opacity: 0.8;
      .item-list {
        width: 100%;
        border-bottom: 1px solid rgba(67, 67, 67, 1);
        height: 41px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        & > div {
          height: 24px;
          width: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          border-radius: 1px;
          &:hover {
            background: #434343;
          }
          &:active,
          &.active {
            background: #333333;
          }
        }
      }
      .color-list {
        width: 100%;
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        .color-box {
          height: 20px;
          width: 20px;
          border-radius: 1px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          margin: 6px;
          .color-block {
            height: 16px;
            width: 16px;
          }
          &:hover {
            border: 1px solid #e6d2d2;
          }
          &:active {
            border: 1px solid #b6aeae;
          }
          &.active {
            border: 1px solid #ffffff;
          }
        }
      }
    }
  }
</style>
