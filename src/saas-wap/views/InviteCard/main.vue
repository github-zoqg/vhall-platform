<template>
  <div class="inviteWrap" style="height: 100%">
    <invitation-Card @changeInvite="changeInvite"></invitation-Card>
    <div @click="toWebinar" class="webinarEntrance">
      <p class="btnVal">进入活动</p>
    </div>
  </div>
</template>

<script>
  import invitationCard from './components/card.vue';
  export default {
    components: {
      invitationCard
    },
    data() {
      return {
        invite: ''
      };
    },
    methods: {
      toWebinar() {
        const id = this.$route.params.id;
        const invite = this.invite;

        this.$router.push(`/lives/watch/${id}?invite=${invite}`);
      },
      changeInvite(val) {
        this.invite = val;
      }
    }
  };
</script>

<style lang="less">
  .inviteWrap {
    position: relative;
    .webinarEntrance {
      position: absolute;
      top: 45px;
      right: 0px;
      background: #e83a37;
      z-index: 1;
      height: 54px;
      width: 160px;
      border-top-left-radius: 27px;
      border-bottom-left-radius: 27px;
      .btnVal {
        width: 100%;
        text-align: center;
        color: #fff;
        height: 54px;
        line-height: 54px;
      }
    }
  }
</style>
