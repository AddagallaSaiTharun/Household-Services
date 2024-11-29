import rating_form from "./rating_form.js";


const otp_form = Vue.component("otp_form", {
  props: ["service_id", "engaged"],
  name: "otp_form",
  template: `<div>
        <div style="background-color: white; padding: 20px; border-radius: 10px; width: 300px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);">
          <h2 style="margin-bottom: 15px; font-size: 24px; color: #333;">Create Service Request</h2>
          <form @submit.prevent="submitForm">
            <div style="margin-bottom: 15px;">
              <label style="font-weight: bold;" for="otp">OTP:</label>
              <input type="number" v-model="otp" style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
            </div>
            <button type="submit" style="width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Submit Request</button>
            <button type="button" @click="$emit('close')" style="width: 100%; padding: 10px; margin-top: 10px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
            <div v-if="message" :style="{color: error ? 'red' : 'green', fontSize: '14px', marginTop: '10px'}">{{ message }}</div>
          </form>
        </div>
        <!-- Popup Overlay -->
      <div
        v-if="showratingForm"
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        "
      >
        <rating_form :srvc_req_id="service_id" :showratingForm="showratingForm"></rating_form>
      </div>
      </div>
      `,
  data() {
    return {
      message: "",
      token: localStorage.getItem("token"),
      error: false,
      otp: null,
      showratingForm: false,
    };
  },
  children:{
    rating_form
  },
  methods: {
    close_review(value) {
      this.showratingForm = value;
      this.$emit("toggleengaged", !this.engaged);
    },
    async submitForm() {
      const res = await axios.post(
        "/api/verifyotp",
        {
          otp: this.otp,
          service_id: this.service_id,
        },
        {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        }
      );
      if (res.status === 200) {
        this.showratingForm = true;
      }
    },
  },
});

export default otp_form;