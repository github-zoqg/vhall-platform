<template>
  <div class="vmp-handup">
    <div>
      <el-button type="primary" size="medium" round v-if="isAllowhandup && !handupEnd">
        举手上麦
      </el-button>
    </div>
    <div><el-button type="primary" size="medium" v-if="handupEnd" round>下麦</el-button></div>
  </div>
</template>
<script>
  export default {
    name: 'VmpHandup',
    data() {
      return {
        isAllowhandup: false, //是否允许上麦,
        handupEnd: false // 是否已经上麦
      };
    }
  };
</script>
