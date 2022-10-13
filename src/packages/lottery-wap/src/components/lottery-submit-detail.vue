<template>
  <div class="lottery-submit-detail">
    <lottery-title :title="$t('interact_tools.interact_tools_1092')" />
    <div class="award-detail">
      <img class="award-img" :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" alt />
      <p class="award-name">
        <i18n path="interact_tools.interact_tools_1093">
          <span class="n" place="n">{{ (prizeInfo && prizeInfo.award_name) || '奖品' }}</span>
        </i18n>
      </p>
    </div>
    <div class="submit-content-container">
      <div class="submit-content">
        <div v-for="(submitItem, idx) of submitInfo" :key="idx" class="submit-content-item">
          <span class="submit-content-label">{{ submitItem.label }}</span>
          <span class="submit-content-value">{{ submitItem.value }}</span>
        </div>
      </div>
    </div>
    <button class="vmp-lottery-btn" v-if="showWinnerList" @click="navToWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </button>
  </div>
</template>
<script>
  import props from './props';
  import LotteryTitle from './lottery-title.vue';
  export default {
    name: 'LotteryWinner',
    mixins: [props],
    inject: ['lotteryServer'],
    components: {
      LotteryTitle
    },
    data() {
      return {
        submitInfo: []
      };
    },
    filters: {
      fmtSerial(val) {
        const serial = `${val + 1}`;
        return serial.padStart(2, '0');
      }
    },
    created() {
      this.getLotteryUserDetail();
    },
    methods: {
      navToWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      },
      getLotteryUserDetail() {
        this.lotteryServer.getLotteryUserDetail(this.lotteryId).then(res => {
          console.log('getLotteryUserDetail', res);
          const data = res.data;
          this.submitInfo = [];
          if (!data) return;
          this.submitInfo.push({
            label: this.$t('interact_tools.interact_tools_1095') + ':',
            value: data.lottery_user_name
          });
          this.submitInfo.push({
            label: this.$t('interact_tools.interact_tools_1096') + ':',
            value: data.lottery_user_phone
          });
          let remark = null;
          try {
            remark = JSON.parse(data.lottery_user_remark);
          } catch (e) {
            console.warn('转换remark', e);
          }
          if (Array.isArray(remark)) {
            remark.forEach(item => {
              if (item.field_key !== 'phone' && item.field_key !== 'name' && item.field_value) {
                this.submitInfo.push({
                  label:
                    item.field_key === 'address'
                      ? this.$t('interact_tools.interact_tools_1097') + ':'
                      : '',
                  value: item.field_value
                });
              }
            });
          }
        });
      }
    }
  };
</script>
<style lang="less">
  .lottery-submit-detail {
    position: relative;
    padding: 0 0 32px;
    text-align: center;
    background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
    border-radius: 20px 20px 0px 0px;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
    .award-detail {
      height: 144px;
      margin: 0 24px;
      padding: 0 32px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 28px 32px;
      background: #fff;
      border-radius: 12px;
    }

    .award-img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      border: 1px solid #d9d9d9;
      object-fit: contain;
    }
    .award-name {
      margin-left: 12px;
      font-weight: 500;
      font-size: 30px;
      color: #fb2626;
    }
    .submit-content-container {
      min-height: 310px;
    }
    .submit-content {
      background: #fff;
      border-radius: 12px;
      padding: 32px;
      margin: 12px 24px 36px;
      min-height: 100px;
      max-height: 360px;
      overflow-y: auto;
    }
    .submit-content-item {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 28px;
      line-height: 40px;
      color: #262626;
      text-align: left;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
      overflow-x: hidden;
    }
    .submit-content-label {
      box-sizing: border-box;
      display: inline-block;
      width: 168px;
      height: 40px;
      color: #8c8c8c;
    }
    .submit-content-value {
      flex: 1;
    }
  }
</style>
