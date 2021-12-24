<template>
  <vmp-basic-layout>
    <template v-slot:vmp-header>
      <vmp-air-container cuid="rootHeader"></vmp-air-container>
    </template>

    <!-- 左侧区域 -->
    <template v-slot:vmp-left-aside></template>

    <template v-slot:vmp-center>中间区域</template>

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
