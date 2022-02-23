<template>
  <div class="pay-fee-wrap"
    :style="{zIndex: dialogZIndexMap.giftPay}">
    <div class="pay-fee">
      <div class="pay-fee__head">
        <span>{{$t('interact_tools.interact_tools_1048')}}</span>
        <span class="close-auth iconfont iconguanbi_icon1"
          @click="close"></span>
      </div>
      <div class="pay-fee__qr">
        <img :src="chooseWx ? wxQr : zfQr"
          alt="">
      </div>
      <span class="pay-fee__tip">{{$t('interact_tools.interact_tools_1052')}}{{tip}}{{$t('interact_tools.interact_tools_1051')}}</span>
      <div class="pay-fee__select">
        <div class="wx"
          @click="changePay('wx')">
          <div class="wx-icon"><span class="pay-wx-icon iconfont iconweixinzhifu"></span><span class="des">{{$t('interact_tools.interact_tools_1049')}}</span></div><span class="circle"
            :class="{'choose': chooseWx}"></span>
        </div>
        <div class="zf"
          @click="changePay('zf')">
          <div class="zf-icon"><span class="pay-zf-icon iconfont iconzhifubao"></span><span class="des">{{$t('interact_tools.interact_tools_1069')}}</span></div> <span class="circle"
            :class="{'choose': !chooseWx}"></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'PayFee',
  props: {
    wxQr: {
      type: String,
      required: true
    },
    zfQr: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      tip: this.$t('nav.nav_1016'),
      chooseWx: true
    };
  },
  computed: {
    ...mapGetters('watchBase', ['dialogZIndexMap'])
  },
  methods: {
    close() {
      this.$emit('closePay');
    },
    changePay(val) {
      if (val == 'wx') {
        this.tip = this.$t('nav.nav_1016');
        this.chooseWx = true;
      } else {
        // TODO待翻译
        this.tip = this.$t('nav.nav_1051');
        this.chooseWx = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.pay-fee-wrap {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 18;
}
.pay-fee {
  width: 364px;
  height: 380px;
  background: #ffffff;
  border-radius: 4px;
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
  margin: 15vh auto;
  box-sizing: border-box;
  padding: 24px 32px 34px;
  &__head {
    width: 100%;
    height: 24px;
    clear: both;
    line-height: 24px;
    margin-bottom: 24px;
    .close-auth {
      float: right;
      &:hover {
        cursor: pointer;
      }
    }
  }
  &__qr {
    width: 140px;
    height: 140px;
    border-radius: 4px;
    border: 1px solid #e2e2e2;
    box-sizing: border-box;
    padding: 10px;
    margin: 0px auto;
    margin-bottom: 12px;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  &__tip {
    display: inline-block;
    width: 100%;
    text-align: center;
    margin-bottom: 30px;
  }
  &__select {
    width: 100%;
    .wx,
    .zf {
      width: 100%;
      height: 24px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 24px;
      &:hover {
        cursor: pointer;
      }
    }
    .wx-icon,
    .zf-icon {
      display: inline-block;
      width: 150px;
    }
    .circle {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 1px solid #999999;
      border-radius: 9px;
    }
    .choose {
      background: #fb3a32;
      text-align: center;
      line-height: 16px;
      position: relative;
      border-color: #fb3a32;
      &:after {
        display: block;
        content: "";
        width: 8px;
        height: 8px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 5px;
        background: #fff;
      }
    }
    .des {
      display: inline-block;
      height: 24px;
      vertical-align: top;
    }
    .pay-wx-icon {
      margin-right: 8px;
      color: #41b035;
      font-size: 24px;
    }
    .pay-zf-icon {
      margin-right: 8px;
      color: #4ba6ec;
      font-size: 24px;
    }
  }
}
</style>
