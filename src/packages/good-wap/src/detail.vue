<template>
  <div class="vh-goods-wrapper-detail">
    <p class="btn-close" @click="goBack">
      <i class="vh-iconfont vh-line-close"></i>
    </p>
    <div class="conents">
      <van-swipe :autoplay="5000" indicator-color="white">
        <van-swipe-item v-for="(item, index) in info.img_list" :key="index">
          <div class="imgBox">
            <img :src="item.img_url" alt />
          </div>
        </van-swipe-item>
      </van-swipe>
      <div class="price">
        <template v-if="info.discount_price">
          <span>
            <b>￥</b>
            {{ info.discount_price }}
          </span>
          <s>￥{{ info.price }}</s>
        </template>
        <template v-else>
          <span>
            <b>￥</b>
            {{ info.price }}
          </span>
        </template>
      </div>
      <div class="introduction">
        <P class="title">{{ info.name }}</P>
        <p class="info">{{ info.description }}</p>
      </div>
    </div>
    <button class="btn-buy" @click="buy">{{ $t('menu.menu_1007') }}</button>
    <van-popup v-model="show" class="tao-wrap">
      <div class="tao-password">
        <span>{{ $t('webinar.webinar_1013') }}</span>
        <span>{{ info.tao_password }}</span>
        <span>{{ $t('webinar.webinar_1014') }}</span>
      </div>
    </van-popup>
  </div>
</template>

<script>
  export default {
    name: 'VmpGoodDetail',
    data() {
      return {
        show: false
      };
    },
    props: ['info'],
    // mounted() {
    //   console.log('mounted wap VmpGoodDetail---------->', this.info);
    // },
    methods: {
      buy() {
        if (this.info.tao_password) {
          this.show = true;
        } else {
          if (window.vhallReport) {
            window.vhallReport.report('GOOD_RECOMMEND', {
              event: moment(new Date()).format('YYYY-MM-DD hh:mm'),
              market_tools_id: this.info.goods_id,
              market_tools_status: 1 // 购买
            });
          }
          window.open(this.info.goods_url);
        }
      },
      goBack() {
        this.$emit('close');
      }
    }
  };
</script>

<style lang="less">
  .vh-goods-wrapper-detail {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 9999999999;
    height: 100%;
    width: 100%;
    background: #fff;
    .btn-close {
      z-index: 99;
      position: fixed;
      right: 30px;
      top: 30px;
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      line-height: 60px;
      text-align: center;
      color: white;
      i {
        font-size: 24px;
      }
    }
    .conents {
      height: calc(100% - 110px);
      overflow-y: auto;
    }
    .good-info {
      padding-bottom: 120px;
    }
    .imgBox {
      width: 100%;
      height: 750px;
      background: #fff;
      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    .price {
      height: 80px;
      background: rgba(252, 86, 89, 1);
      font-size: 30px;
      color: rgba(255, 255, 255, 1);
      padding: 0 30px;
      s,
      span {
        display: inline-block;
        line-height: 80px;
      }
      span {
        height: 100%;
        margin-right: 20px;
        font-size: 36px;
        b {
          font-size: 26px;
        }
      }
      s {
        font-size: 30px;
        color: rgba(255, 255, 255, 1);
      }
    }
    .introduction {
      padding: 0 30px 20px;
      background: #fff;
      .title {
        padding: 30px 0;
        font-size: 36px;
        font-weight: bold;
        color: rgba(34, 34, 34, 1);
      }
      .info {
        font-size: 28px;
        line-height: 40px;
        color: rgba(136, 136, 136, 1);
        word-break: break-all;
      }
    }
    .btn-buy {
      height: 110px;
      background: rgba(252, 86, 89, 1);
      position: fixed;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      width: 100%;
      font-size: 40px;
      color: rgba(255, 255, 255, 1);
    }
    .btnDisabled {
      background: #a9a9a9;
    }
    // 淘口令
    .tao-wrap {
      width: 630px;
      min-height: 444px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 1);
      overflow: hidden;
      padding: 30px 40px;
      .tao-password {
        display: flex;
        flex-direction: column;
        span {
          line-height: 50px;

          &:nth-child(1) {
            font-weight: bolder;
            text-align: center;
            margin: 0 0 20px;
            color: #000;
            font-size: 36px;
          }
          &:nth-child(2) {
            border: 2px solid #dddddd;
            padding: 20px;
            width: 550px;
            margin: 0 auto 20px;
            font-size: 24px;
            min-height: 214px;
            border-radius: 8px;
            color: #666;
            word-break: break-all;
          }
          &:nth-child(3) {
            font-size: 28px;
            color: #333;
            line-height: 40px;
            text-align: center;
            margin: 0 auto;
            width: 494px;
          }
        }
      }
    }
    .van-swipe__track {
      width: 100%;
    }
  }
</style>
