<template>
  <el-dialog title="提示" :visible.sync="reverse" width="300px">
    <el-timeline :reverse="reverse">
      <el-timeline-item v-for="lottery in winLotteryHistory" :key="lottery.id">
        {{ lottery | prizeName }}
      </el-timeline-item>
    </el-timeline>
  </el-dialog>
</template>
<script>
  export default {
    props: {
      winLotteryHistory: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    filters: {
      prizeName(lottery) {
        if (!lottery.award_snapshoot) return '奖品';
        return lottery.award_snapshoot?.award_name || '奖品';
      }
    },
    data() {
      return {
        reverse: true
      };
    }
  };
</script>
