const dataReportMixin = {
  methods: {
    //埋点上报
    buriedPointReport(code, sourceData = {}) {
      let defaultData = {
        business_uid: this.userId,
        user_id: '',
        webinar_id: this.webinarId,
        refer: '',
        s: '',
        report_extra: {},
        ref_url: '',
        req_url: ''
      };
      let data = Object.assign({}, defaultData, sourceData);
      console.log(data);
      // this.$vhall_paas_port({
      //   k: code,
      //   data: data
      // });
    }
  }
};

export default dataReportMixin;
