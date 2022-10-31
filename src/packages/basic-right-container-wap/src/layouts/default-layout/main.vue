<template>
  <div class="vmp-container-right-wap" v-if="!isInGroup">
    <div class="base-box" v-show="showIcon">
      <!-- 问卷 -->
      <questionnaire-icon class="icon-wrap" @clickIcon="checkQuestionnaireIcon" />
      <!-- 签到 -->
      <div class="icon-wrap" @click="handleSign" v-show="showSign && webinarType == 1">
        <!-- <div class="have"></div> -->
        <img src="../../common/image/icon.png" />
      </div>
      <!-- 抽奖 -->
      <lottery-icon
        v-if="webinarType == 1 || webinarType == 3"
        class="icon-wrap"
        @clickIcon="checkLotteryIcon"
      />
      <!-- 红包 -->
      <red-packet-icon
        class="icon-wrap"
        v-if="!isEmbed && webinarType == 1"
        @clickIcon="handleRedPacket"
      />
      <!-- 计时器 -->
      <div class="icon-wrap" @click="handleTimer" v-show="showTimer && webinarType == 1">
        <!-- <div :class="!timerVisible ? 'have' : ''"></div> -->
        <img src="../../common/image/timer.png" v-if="timerVisible" />
        <img src="../../common/image/timer_no.png" v-else />
      </div>
      <!-- 公告列表 -->
      <noticeList></noticeList>
    </div>
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>

<script src="../../common/js/main.js"></script>

<style lang="less">
  .vmp-container-right-wap {
    width: fit-content;
    .base-box {
      display: flex;
      flex-direction: column;
      position: absolute;
      display: inline-block;
      right: 24px;
      bottom: 108px;
      // width: 20px;
      .icon-wrap {
        margin-top: 24px;
        max-width: 60px;
        max-height: 60px;
        position: relative;
        background-color: transparent;
        img {
          width: 60px;
          height: 60px;
        }
      }
      .have {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: #ff0005;
        content: '';
      }
    }
  }
</style>
