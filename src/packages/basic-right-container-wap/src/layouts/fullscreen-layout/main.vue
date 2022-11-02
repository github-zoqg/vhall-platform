<template>
  <div class="vmp-container-right-fullscreen-wap" v-if="!isInGroup">
    <div class="base-box" v-show="showIcon">
      <!-- 问卷 -->
      <questionnaire-icon
        :icon-style="iconStyle"
        class="icon-wrap"
        @clickIcon="checkQuestionnaireIcon"
      >
        <span class="icon-name">问卷</span>
      </questionnaire-icon>
      <!-- 签到 -->
      <div class="icon-wrap" @click="handleSign" v-show="showSign && webinarType == 1">
        <img v-if="iconStyle == 1" src="../../common/image/icon.png" />
        <img v-else src="../../common/image/icon2.png" />
        <span class="icon-name">签到</span>
      </div>
      <!-- 抽奖 -->
      <lottery-icon
        :icon-style="iconStyle"
        v-if="webinarType == 1 || webinarType == 3"
        class="icon-wrap"
        @clickIcon="checkLotteryIcon"
      >
        <span class="icon-name">抽奖</span>
      </lottery-icon>
      <!-- 红包 -->
      <red-packet-icon
        :icon-style="iconStyle"
        class="icon-wrap"
        v-if="!isEmbed && webinarType == 1"
        @clickIcon="handleRedPacket"
      >
        <span class="icon-name">红包</span>
      </red-packet-icon>
      <!-- 计时器 -->
      <div class="icon-wrap" @click="handleTimer" v-show="showTimer && webinarType == 1">
        <template v-if="iconStyle == 1">
          <img src="../../common/image/timer.png" v-if="timerVisible" />
          <img src="../../common/image/timer_no.png" v-else />
        </template>
        <template v-else>
          <img src="../../common/image/timer2.png" v-if="timerVisible" />
          <img src="../../common/image/timer_no2.png" v-else />
        </template>

        <span class="icon-name">计时器</span>
      </div>
      <!-- 公告列表 -->
      <noticeList :icon-style="iconStyle" class="icon-wrap">
        <span class="icon-name">公告</span>
      </noticeList>
    </div>
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>

<script src="../../common/js/main.js"></script>

<style lang="less">
  .vmp-container-right-fullscreen-wap {
    width: fit-content;
    padding-top: 16px;
    .base-box {
      display: flex;
      margin-left: 8px;
      .icon-wrap {
        width: 72px;
        height: 72px;
        background: rgba(0, 0, 0, 0.3);
        position: relative;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 16px;
        img {
          width: 60px;
          height: 60px;
        }
        .icon-name {
          position: absolute;
          width: 72px;
          height: 22px;
          left: 0px;
          bottom: 0px;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 0px 0px 16px 16px;
          font-size: 14px;
          text-align: center;
          line-height: 22px;
          color: #ffffff;
          text-shadow: 0px 1px 2px rgba(118, 0, 0, 0.1);
        }
      }
      .icon-wrap-notice {
        margin-top: 0;
      }
    }
    .vmp-question-wap {
      height: calc(100% - 422px);
      bottom: 0;
      top: auto;
    }
  }
</style>
