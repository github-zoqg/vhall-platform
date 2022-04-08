<template>
  <div class="vmp-reward">
    <div
      v-show="showRewardDialog"
      class="reward-dialog-wrapper"
      :style="{ zIndex: zIndexServerState.zIndexMap.reward }"
    >
      <!-- 支付金额设置弹框 -->
      <div v-if="!showGiveMoneyQr" class="reward-dialog">
        <div class="reward-content-container">
          <div
            v-for="(item, index) in defaultPayNumList"
            :key="index"
            class="reward-item"
            :class="{ active: activeItem == index }"
            @click="onClickRewardItem(index)"
          >
            <span class="money-icon">￥</span>
            <span>{{ item }}</span>
          </div>
          <el-input
            v-model.trim.number="customRewardInfo.money"
            class="reward-input"
            :placeholder="$t('interact_tools.interact_tools_1046')"
            @input="handleInput"
          >
            <span slot="prefix" class="money-icon">￥</span>
          </el-input>
          <el-input
            v-model="customRewardInfo.desc"
            class="reward-input desc"
            maxlength="15"
            :placeholder="$t('interact_tools.interact_tools_1047')"
          >
            <div slot="suffix" style="font-size: 10px; color: #999">
              <span
                :style="{
                  color:
                    customRewardInfo.desc.length == 15
                      ? '#fb3a32'
                      : customRewardInfo.desc.length > 0
                      ? '#3562fa'
                      : ''
                }"
              >
                {{ customRewardInfo.desc.length }}
              </span>
              <span>/</span>
              <span>15</span>
            </div>
          </el-input>
        </div>
        <div class="reward-pay-btn">
          <div class="reward-pay-btn-in" @click="handleGiveMoney">
            {{ $t('interact_tools.interact_tools_1050') }}
          </div>
        </div>
        <i class="reward-close-btn iconfont iconguanbi1_icon" @click="closeDialog"></i>
      </div>
      <!-- 付款二维码弹框 -->
      <div v-if="showGiveMoneyQr" class="reward-dialog reward-pay-dialog">
        <p class="pay-dialog__header">
          <span class="pay-dialog__header-title">
            {{ $t('interact_tools.interact_tools_1048') }}
          </span>
          <span class="iconfont iconguanbi_icon" @click="closeDialog"></span>
        </p>
        <div class="pay-dialog__body">
          <div class="pay-qr-box">
            <div v-show="!qrLoaded" class="pay-qr-mark"></div>
            <img :src="giveMoneyUrl" alt="" class="pay-qr-img" @load="onLoaded" />
          </div>
        </div>
        <p class="pay-dialog-desc">
          {{ payMode === 0 ? $t('nav.nav_1016') : $t('nav.nav_1051')
          }}{{ $t('interact_tools.interact_tools_1051') }}
        </p>
        <div class="pay-dialog__footer">
          <div class="pay-checkbox-item clearfix">
            <div class="pay-checkbox-item__left">
              <img class="pay-icon" src="./img/wx-icon.png" alt="" />
              <span class="pay-title">{{ $t('interact_tools.interact_tools_1049') }}</span>
            </div>
            <div
              class="pay-checkbox-item__right"
              :class="{ active: payMode === 0 }"
              @click="changePayMode(0)"
            ></div>
          </div>
          <div class="pay-checkbox-item clearfix">
            <div class="pay-checkbox-item__left">
              <img class="pay-icon" src="./img/zfb-icon.png" alt="" />
              <span class="pay-title">{{ $t('interact_tools.interact_tools_1069') }}</span>
            </div>
            <div
              class="pay-checkbox-item__right"
              :class="{ active: payMode === 1 }"
              @click="changePayMode(1)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./reward.js"></script>

<style lang="less">
  .vmp-reward {
    color: black;
    .vhsaas-reward-icon {
      width: 32px;
      cursor: pointer;
      margin-left: 16px;
    }
    .reward-dialog-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 23;
      .reward-dialog {
        width: 399px;
        height: 463px;
        background: url(./img/bg-reward.png);
        background-size: 100% auto;
        margin-top: 15vh;
        margin-left: 50%;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        .reward-content-container {
          height: 100px;
          width: 238px;
          margin-top: 146px;
          .reward-item {
            width: 72px;
            height: 60px;
            border-radius: 4px;
            border: 1px solid #fbc37a;
            font-weight: 600;
            font-size: 22px;
            color: #fb3a32;
            line-height: 60px;
            text-align: center;
            background-color: #fefce4;
            float: left;
            margin-left: 8px;
            cursor: pointer;
            user-select: none;
            font-family: Barlow;
            &:first-child {
              margin-left: 0;
            }
            &:hover {
              border-color: #fb3931;
            }
            &.active {
              background: linear-gradient(180deg, #ff794d 0%, #eb251c 100%);
              color: #ffffff;
              border-color: rgba(0, 0, 0, 0);
            }
            .money-icon {
              font-size: 12px;
            }
          }
          .reward-input {
            &:last-child {
              vertical-align: top;
            }
            margin-top: 10px;
            line-height: 40px;
            ::v-deep .el-input__inner {
              line-height: 36px;
              height: 36px;
              border: 1px solid #fbc37a;
              background-color: #fefce4;
              &:hover {
                border-color: #fa3730;
              }
              &::-webkit-input-placeholder {
                color: #666666;
              }
              &:-moz-placeholder {
                color: #666666;
              }
              &::-moz-placeholder {
                color: #666666;
              }
              &:-ms-input-placeholder {
                color: #666666;
              }
            }
            ::v-deep .el-input__count-inner {
              background-color: #fefce4;
            }
            ::v-deep .el-input__prefix {
              left: 0;
              .money-icon {
                line-height: 36px;
                margin-left: 10px;
                color: #666;
                font-size: 14px;
              }
            }
            &.desc {
              ::v-deep .el-input__inner {
                padding-right: 48px !important;
              }
            }
          }
        }
        .reward-pay-btn {
          width: 66px;
          height: 66px;
          box-sizing: border-box;
          padding: 1px;
          border-radius: 33px;
          // border-image: linear-gradient(#fff9b4, #fb9b2d) 1;
          position: absolute;
          bottom: 56px;
          &-in {
            width: 100%;
            height: 100%;
            border-radius: 33px;
            background-image: linear-gradient(#fdfced, #fabd2f);
            cursor: pointer;
            user-select: none;
            text-align: center;
            line-height: 66px;
            font-size: 22px;
            font-weight: 600;
            color: #e11b37;
          }
        }
        .reward-close-btn {
          position: absolute;
          bottom: -24px;
          font-size: 30px;
          color: #ffffff;
          cursor: pointer;
        }
        &.reward-pay-dialog {
          width: 364px;
          height: 380px;
          box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          background: #ffffff;
          .pay-dialog__header {
            width: calc(100% - 64px);
            padding: 24px 32px;
            padding-bottom: 0;
            &-title {
              font-weight: 500;
              font-size: 20px;
              color: #1a1a1a;
              line-height: 24px;
              float: left;
            }
            .iconguanbi_icon {
              font-size: 16px;
              float: right;
              line-height: 24px;
              cursor: pointer;
            }
          }
          .pay-dialog__body {
            margin-top: 24px;
            .pay-qr-box {
              width: 140px;
              height: 140px;
              border-radius: 4px;
              border: 1px solid #e2e2e2;
              overflow: hidden;
              position: relative;
              .pay-qr-mark {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 1;
              }
              .pay-qr-img {
                width: 140px;
                transform: scale(1.1);
              }
            }
          }
          .pay-dialog-desc {
            margin-top: 12px;
            font-size: 14px;
            font-weight: 400;
            color: #1a1a1a;
            line-height: 20px;
          }
          .pay-dialog__footer {
            margin-top: 30px;
            width: 216px;
            .pay-checkbox-item {
              line-height: 1;
              .pay-checkbox-item__left {
                float: left;
                .pay-icon {
                  width: 26px;
                }
                .pay-title {
                  line-height: 26px;
                  font-size: 14px;
                  color: #1a1a1a;
                  margin-left: 8px;
                }
              }
              .pay-checkbox-item__right {
                width: 14px;
                height: 14px;
                border: 1px solid #999999;
                border-radius: 8px;
                float: right;
                margin-top: 5px;
                cursor: pointer;
                &.active {
                  width: 8px;
                  height: 8px;
                  border: 4px solid #fb3a32;
                }
              }
              &:last-child {
                margin-top: 22px;
              }
            }
          }
        }
      }
    }
  }
</style>
