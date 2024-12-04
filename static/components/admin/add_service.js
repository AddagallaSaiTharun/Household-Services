import navbar from "../navbar.js";
import footerman from "../footer.js";

const add_service = Vue.component("add-service", {
  template: `
    <div id="add-service">
      <navbar />
      <div style="max-width: 500px; margin: auto; padding: 20px; margin-top:1in; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
        <h2 style="text-align: center; font-size: 24px; color: #333; margin-bottom: 20px;">Add Service</h2>
        
        <form @submit.prevent="submitForm" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 15px;">
          
          <div style="display: flex; flex-direction: column;">
            <label for="service_name" style="font-size: 16px; color: #555; margin-bottom: 5px;">Service Name:</label>
            <input type="text" id="service_name" v-model="service.service_name" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          </div>
          
          <div style="display: flex; flex-direction: column;">
            <label for="Category" style="font-size: 16px; color: #555; margin-bottom: 5px;">Category:</label>
            <input type="text" id="Category" v-model="service.category" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          </div>

          <div style="display: flex; flex-direction: column;">
            <label for="time_req" style="font-size: 16px; color: #555; margin-bottom: 5px;">Time Required (in minutes):</label>
            <input type="number" id="time_req" v-model="service.time_req" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          </div>
        
          <div style="display: flex; flex-direction: column;">
            <label for="service_base_price" style="font-size: 16px; color: #555; margin-bottom: 5px;">Base Price:</label>
            <input type="number" id="service_base_price" v-model="service.service_base_price" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          </div>
        
          <div style="display: flex; flex-direction: column;">
            <label for="service_dscp" style="font-size: 16px; color: #555; margin-bottom: 5px;">Service Description:</label>
            <textarea id="service_dscp" v-model="service.service_dscp" required style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; min-height: 100px;"></textarea>
          </div>
        
          <div style="display: flex; flex-direction: column;">
            <label for="service_image" style="font-size: 16px; color: #555; margin-bottom: 5px;">Service Image:</label>
            <input type="file" id="service_image" @change="onFileChange" accept=".jpg,.jpeg" style="padding: 5px; font-size: 16px; border: 1px solid #ddd; border-radius: 5px;">
          </div>
        
          <div style="text-align: center; margin-top: 20px;">
            <button type="submit" style="padding: 12px 24px; background-color: #4CAF50; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background-color 0.3s ease;">
              Submit
            </button>
          </div>
        </form>
        <p v-if="message" :style="{ color: messageColor, textAlign: 'center', marginTop: '20px' }">{{ message }}</p>
      </div>
      <footerman />
    </div>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      service: {
        service_name: "",
        category: "",
        time_req: "",
        service_base_price: "",
        service_dscp: "",
        service_image: null,
      },
      message: "",
      messageColor: "green",
    };
  },
  methods: {
    onFileChange(event) {
      this.service.service_image = event.target.files[0];
    },
    async submitForm() {
      try {
        const response = await axios.post("/api/service", this.service, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 201) {
          this.message = "Service added successfully!";
          this.messageColor = "green";
          this.resetForm();
        }
      } catch (error) {
        this.message = "Error submitting form. Try again!";
        this.messageColor = "red";
        console.error("Error:", error);
      }
    },
    resetForm() {
      this.service = {
        service_name: "",
        time_req: "",
        service_base_price: "",
        service_dscp: "",
        service_image: null,
      };
    },
  },
  components: { navbar, footerman },
});

export default add_service;