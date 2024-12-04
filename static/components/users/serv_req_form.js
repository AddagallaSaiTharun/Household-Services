const ServiceRequestForm = Vue.component("serv_req_form", {
  template: `
    <div style="background-color: white; padding: 20px; border-radius: 10px; width: 5in; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);">
      <h2 style="margin-bottom: 15px; font-size: 24px; color: #333;">Create Service Request</h2>
      <form @submit.prevent="submitForm">
        <!-- Service Name -->
        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold;">Service Name:</label>
          <p style="margin: 5px 0; font-size: 16px; color: #555;">{{ serviceDetails.service_name }}</p>
        </div>

        <!-- Professional Name -->
        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold;">Professional Name:</label>
          <p style="margin: 5px 0; font-size: 16px; color: #555;">{{ professionalName }}</p>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold;" for="from_date">From Date:</label>
          <input type="date" v-model="serviceRequestData.date_srvcreq" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
        </div>

        <div style="margin-bottom: 15px;">
          <label style="font-weight: bold;" for="remarks">Remarks:</label>
          <textarea v-model="serviceRequestData.remarks" rows="3" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
        </div>

        <button type="submit" style="width: 100%; padding: 10px; background-color: #007bff; transition: background-color 0.3s ease; color: white; border: none; border-radius: 5px; cursor: pointer;">Submit Request</button>
        <button type="button" @click="$emit('close')" style="width: 100%; padding: 10px; margin-top: 10px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
        <div v-if="message" :style="{color: error ? 'red' : 'green', fontSize: '14px', marginTop: '10px'}">{{ message }}</div>
      </form>
    </div>
  `,
  props: ["srvc_id", "prof_id", "serviceDetails", "professionalName"],
  data() {
    return {
      token: localStorage.getItem("token"),
      message: "",
      error: false,
      serviceRequestData: {
        srvc_id: this.srvc_id,
        prof_id: this.prof_id,
        remarks: "",
        date_srvcreq: ""
      }
    };
  },
  methods: {
    async submitForm() {
      try {
        const res = await axios.post("/api/srvcreq",this.serviceRequestData, {
          headers: {
            Authorization: "Bearer " + this.token,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 201) {
          this.message = "Service request created successfully!";
          this.error = false;
          this.$emit("close");
        }
      } 
      catch (error) {
        console.error("Error response:", error.response);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Data:", error.response.data);
        }
        this.message = "An error occurred while creating the service request.";
        this.error = true;
      }
      
    }
  }
});

export default ServiceRequestForm;
