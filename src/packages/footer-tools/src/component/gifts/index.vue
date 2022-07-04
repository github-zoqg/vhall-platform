<template>
  <div class="vh-gift" :class="{ 'vh-gift-big': moreList.length > 0 }" @click.stop>
    <transition name="fade">
      <div
        v-if="showGiftInfo"
        class="gift-info"
        :class="moreClassName"
        @mouseout="handleMouseout(-1)"
        @mouseover="handleClearTime()"
      >
        <img v-if="!giftInfo.hoverImg" class="gift-info-pic" :src="giftInfo.image_url" />
        <img v-else class="gift-info-pic" :src="giftInfo.hoverImg" />
        <div class="gift-info-cont">
          <span class="name">{{ $tdefault(giftInfo.name) }}</span>
          <div class="price">
            <span>
              <!-- TODO:支付牌照问题 -->
              <!-- ￥{{
                giftInfo.price == '0' ? $t('interact_tools.interact_tools_1058') : giftInfo.price
              }} -->
            </span>
            <span class="send-btn" :class="{ disable: btnDisabled }" @click="sendGift('WEIXIN')">
              {{ $t('interact_tools.interact_tools_1030') }}{{ btnDisabled ? `(${counter})` : '' }}
            </span>
          </div>
        </div>
      </div>
    </transition>
    <template v-if="moreList.length > 0">
      <el-carousel
        :autoplay="false"
        arrow="never"
        height="184px"
        :class="{ hideCircle: moreList.length <= 1 }"
        indicator-position="outside"
        :loop="false"
        @change="handleChangePage"
      >
        <el-carousel-item v-for="(cut, index) in moreList" :key="index">
          <div
            v-for="(gift, i) in cut"
            :key="gift.id"
            class="gift-item"
            @mouseover="handleMouseover(gift, i)"
            @mouseout="handleMouseout(i)"
          >
            <img v-if="!gift.hoverImg" :src="gift.image_url" />
            <img v-else :src="gift.hoverImg" />
          </div>
        </el-carousel-item>
      </el-carousel>
    </template>
    <div class="less-gift">
      <div
        v-for="(gift, i) in list"
        :key="gift.id"
        class="gift-item"
        @mouseover="handleMouseover(gift, i)"
        @mouseout="handleMouseout(i)"
      >
        <img v-if="!gift.hoverImg" :src="gift.image_url" />
        <img v-else :src="gift.hoverImg" />
      </div>
    </div>
  </div>
</template>
<script src="./gift"></script>
<style lang="less" scoped>
  .vh-gift {
    position: absolute;
    top: -140px;
    right: -60px;
    z-index: 12;
    width: 450px;
    height: 112px;
    background: #ffffff;
    border-radius: 8px;
    box-sizing: border-box;
    padding: 16px 16px 16px 8px;
    box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
    .less-gift {
      display: flex;
      flex-direction: row;
      // justify-content: space-between;
      justify-content: flex-start;
    }
    .gift-item {
      display: inline-block;
      position: relative;
      width: 78px;
      height: 78px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e6e6e6;
      background: #fff;
      margin-left: 8px;
      &:hover {
        border: 1px solid #e7181e;
        cursor: pointer;
      }
    }
    img {
      display: inline-block;
      width: 100%;
      height: 100%;
      border-radius: 4px;
      object-fit: scale-down;
    }
    .gift-info {
      position: absolute;
      height: 108px;
      width: 304px;
      background: #ffffff;
      box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      top: 0px;
      left: 0px;
      z-index: 10;
      box-sizing: border-box;
      padding: 14px 16px;
      transition: all 0.3s;
      &-pic {
        vertical-align: top;
        margin-right: 8px;
        display: inline-block;
        width: 80px;
        height: 80px;
        object-fit: scale-down;
      }
      &-cont {
        vertical-align: top;
        display: inline-block;
        width: 184px;
        height: 80px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        padding-top: 12px;
        box-sizing: border-box;
        .name {
          display: block;
          font-size: 18px;
          color: #1a1a1a;
          line-height: 25px;
        }
        .price {
          margin-top: 6px;
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          color: #fb3a32;
          line-height: 20px;
          .send-btn {
            width: 62px;
            height: 30px;
            background: #fb3a32;
            border-radius: 15px;
            color: #fff;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
            &.disable {
              pointer-events: none;
              cursor: default;
              background-color: rgba(251, 58, 50, 0.6);
            }
          }
        }
      }
    }
    .more-info-0 {
      top: -100px;
      left: -80px;
    }
    .more-info-1 {
      top: -100px;
      left: 25px;
    }
    .more-info-2 {
      top: -100px;
      left: 120px;
    }
    .more-info-3 {
      top: -100px;
      left: 180px;
    }
    .more-info-4 {
      top: -11px;
      left: -80px;
    }
    .more-info-5 {
      top: -11px;
      left: 25px;
    }
    .more-info-6 {
      top: -11px;
      left: 120px;
    }
    .more-info-7 {
      top: -11px;
      left: 180px;
    }
    .less-info-0 {
      top: -102px;
      left: -40px;
    }
    .less-info-1 {
      top: -102px;
      left: 40px;
    }
    .less-info-2 {
      top: -102px;
      left: 100px;
    }
    .less-info-3 {
      top: -102px;
      left: 140px;
    }
    .less-info-4 {
      top: -102px;
      left: 180px;
    }
  }
  .vh-gift-big {
    width: 376px;
    height: 208px;
    padding-bottom: 0px;
    padding: 16px 16px 0px 8px;
    position: absolute;
    top: -220px;
    right: -60px;
    z-index: 12;
  }
  ::v-deep > .el-carousel {
    width: 100%;
    height: 100%;
    text-align: left;
    overflow: hidden;
    &__container {
      height: 176px !important;
      width: 100%;
      > .el-carousel__item {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        // justify-content: space-around;
        justify-content: flex-start;
      }
      .gift-item {
        display: inline-block;
        position: relative;
        width: 78px;
        height: 78px;
        background: #ffffff;
        border-radius: 4px;
        border: 1px solid #e6e6e6;
        margin-left: 8px;
        &:hover {
          border: 1px solid #e7181e;
          cursor: pointer;
        }
      }
      img {
        display: inline-block;
        width: 78px;
        height: 78px;
        border-radius: 4px;
        object-fit: scale-down;
      }
    }
    &__indicators {
      display: flex;
      justify-content: center;
      margin-left: 8px;
      .el-carousel__indicator {
        padding: 0px;
        width: 8px;
        height: 8px;
        border-radius: 5px;
        background: @font-dark-normal;
        margin: 0px 2px;
        .el-carousel__button {
          width: 8px;
          height: 8px;
          border-radius: 5px;
          background: @font-dark-normal;
          &:hover {
            background: @font-high-light-normal;
          }
        }
      }
      .is-active {
        .el-carousel__button {
          background: @font-high-light-normal;
        }
      }
    }
  }
  ::v-deep > .hideCircle {
    .el-carousel__indicators {
      display: none;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
</style>
