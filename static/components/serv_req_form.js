const serv_req_form = Vue.component("req_form", {
  name: "serv_req_form",
  template: `
      <div style="background-color: white; padding: 20px; border-radius: 10px; width: 300px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);">
        <h2 style="margin-bottom: 15px; font-size: 24px; color: #333;">Create Service Request</h2>
        <form @submit.prevent="submitForm">
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold;" for="srvc_id">Service ID:</label>
            <input type="text" v-model="srvc_id" readonly style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold;" for="prof_id">Professional ID:</label>
            <input type="text" v-model="prof_id" readonly style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold;" for="from_date">From Date:</label>
            <input type="date" v-model="from_date" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold;" for="to_date">To Date:</label>
            <input type="date" v-model="to_date" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="font-weight: bold;" for="remarks">Remarks:</label>
            <textarea v-model="remarks" rows="3" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
          </div>
          <button type="submit" style="width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Submit Request</button>
          <button type="button" @click="$emit('close')" style="width: 100%; padding: 10px; margin-top: 10px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
          <div v-if="message" :style="{color: error ? 'red' : 'green', fontSize: '14px', marginTop: '10px'}">{{ message }}</div>
        </form>
      </div>
    `,
  props: ["user_id", "srvc_id", "prof_id"],
  data() {
    return {
      token: localStorage.getItem("token"),
      remarks: "",
      message: "",
      error: false,
      from_date: "",
      to_date: "",
    };
  },
  methods: {
    async submitForm() {
      const formData = new FormData();
      formData.append("user_id", this.user_id);
      formData.append("srvc_id", this.srvc_id);
      formData.append("prof_id", this.prof_id);
      formData.append("remarks", this.remarks);
      formData.append("date_srvcreq", this.from_date);
      formData.append("date_cmpltreq", this.to_date);

      const res = await axios.post("/api/srvcreq",formData,{
        headers:{
          Authorization: "Bearer " + this.token,
        }
      })
      if (res.status === 201) {
        window.location.href = "/";
      }
    },
  },
});

export default serv_req_form;
