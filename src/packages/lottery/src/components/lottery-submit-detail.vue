<template>
  <div class="lottery-box lottery-submit-detail">
    <lottery-title :title="$t('interact_tools.interact_tools_1092')" />
    <div class="award-detail">
      <img class="award-img" :src="(prizeInfo && prizeInfo.image_url) || defaultLotteryImg" alt />
      <p class="award-name">
        <i18n path="interact_tools.interact_tools_1093">
          <span class="n" place="n">{{ fitment.name || '奖品' }}</span>
        </i18n>
      </p>
    </div>
    <div class="submit-content">
      <div v-for="(submitItem, idx) of submitInfo" :key="idx" class="submit-content-item">
        <span class="submit-content-label">{{ submitItem.label }}</span>
        <span class="submit-content-value">{{ submitItem.value }}</span>
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
            // label: 'Phone Number:',
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
    .award-detail {
      box-sizing: border-box;
      height: 72px;
      padding: 0 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 14px 16px;
      background: #fff;
      border-radius: 4px;
    }

    .award-img {
      width: 45px;
      height: 45px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
    }
    .award-name {
      margin-left: 15px;
      font-weight: 500;
      font-size: 15px;
      color: #fb2626;
    }
    .submit-content {
      background: #fff;
      border-radius: 4px;
      padding: 12px;
      margin-top: 4px;
      min-height: 50px;
      max-height: 200px;
      overflow-y: auto;
    }
    .submit-content-item {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      font-size: 14px;
      line-height: 22px;
      color: #262626;
      text-align: left;
      &:not(:last-child) {
        margin-bottom: 8px;
      }
    }
    .submit-content-label {
      box-sizing: border-box;
      display: inline-block;
      width: 112px;
      height: 22px;
      color: #8c8c8c;
    }
    .submit-content-value {
      flex: 1;
    }
    .vmp-lottery-btn {
      margin-top: 42px;
      width: 250px;
    }
  }
</style>
