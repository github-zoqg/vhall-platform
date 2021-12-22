<template>
  <vmp-basic-layout>
    <template v-slot:vmp-header></template>

    <template v-slot:vmp-center>
      <h2><vmp-aside></vmp-aside></h2>
    </template>

    <template v-slot:vmp-right-hd>
      <h2>视频区域</h2>
    </template>

    <template v-slot:vmp-right-bd>
      <h2>聊天区域</h2>
    </template>
  </vmp-basic-layout>
</template>

<script>
  import VmpBasicLayout from '@/packages/basic-layout';

  export default {
    name: 'Home',
    components: {
      VmpBasicLayout
    }
  };
</script>
