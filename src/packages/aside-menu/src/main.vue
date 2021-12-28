<template>
  <div class="vmp-aside-menu">
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>
<script>
  export default {
    name: 'VmpAsideMenu',
    methods: {
      setSelectedState(cuid) {
        window.$serverConfig[this.cuid].children?.forEach(element => {
          window.$middleEventSdk.serverPool.get(element).setSelectedState(element === cuid);
        });
      }
    }
  };
</script>
