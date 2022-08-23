<template>
  <div class="inviteWrap">
    <invitation-Card @changeInvite="changeInvite"></invitation-Card>
    <div @click="toWebinar" class="webinarEntrance">
      <p class="btnVal">{{ $t('webinar.webinar_1015') }}</p>
    </div>
  </div>
</template>

<script>
  import invitationCard from './components/card.vue';
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    components: {
      invitationCard
    },
    data() {
      return {
        invite: ''
      };
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    async created() {
      await this.roomBaseServer.getLangList(this.$route.params.id);
      const roomBaseState = this.roomBaseServer.state;
      document.title = roomBaseState.languages.curLang.subject;
      let lang = roomBaseState.languages.lang;
      this.$i18n.locale = lang.type;
    },
    methods: {
      toWebinar() {
        const id = this.$route.params.id;
        const invite = this.invite;

        location.replace(
          `${window.location.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${id}?invite=${invite}`
        );
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
    height: 100%;
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
