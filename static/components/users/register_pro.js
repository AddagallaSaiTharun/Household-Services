import navbar from "../navbar.js";
import footerman from "../footer.js";

const register_pro = Vue.component("register_pro", {
  template: `
    <div id="register-pro">
      <navbar />
      <div v-if="user" style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); margin-top: 1in;">
        <h2 style="font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">Register as a Pro</h2>
        <form @submit.prevent="registerPro" style="display: flex; flex-direction: column; gap: 15px;">
          <h2 style="font-size: 20px; color: #333; text-align: center;">Welcome, {{ user }}!</h2>

          <div style="display: flex; flex-direction: column;">
            <label for="experience" style="font-size: 16px; color: #555; margin-bottom: 5px;">Experience in years:</label>
            <input type="number" id="experience" v-model="registerProfessinalData.prof_exp" required 
              style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
          </div>

          <div style="display: flex; flex-direction: column;">
            <label for="desc" style="font-size: 16px; color: #555; margin-bottom: 5px;">Description:</label>
            <textarea id="desc" v-model="registerProfessinalData.prof_dscp" required 
              style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; min-height: 100px;"></textarea>
          </div>

          <div style="display: flex; flex-direction: column;">
            <label for="service_id" style="font-size: 16px; color: #555; margin-bottom: 5px;">Service Name:</label>
            <select id="service_id" v-model="registerProfessinalData.prof_srvcid" required 
              style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
              <option value="">Select a service</option>
              <option v-for="service in services" :value="service.service_id">{{ service.service_name }}</option>
            </select>
          </div>

          <div style="text-align: center; margin-top: 20px;">
            <button type="submit" style="padding: 12px 24px; background-color: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; transition: background-color 0.3s ease;">
              Register
            </button>
          </div>
        </form>
      </div>
      <footerman />
    </div>
  `,
  async created() {
    try {
      this.user = localStorage.getItem('user');
      const response = await axios.get("/api/service", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      this.services = JSON.parse(response.data)["content"];
    } catch (error) {
      console.error("Error fetching service data:", error);
    }
  },
  data() {
    return {
      user: null,
      token: localStorage.getItem("token"),
      registerProfessinalData: {
        prof_exp: 0,
        prof_dscp: null,
        prof_srvcid: null,
        prof_join_date: null,
      },
      services: [],
    };
  },
  methods: {
    async registerPro() {
      this.registerProfessinalData.prof_join_date = new Date().toISOString().split("T")[0];
      try {
        const response = await axios.post("/api/professional", this.registerProfessinalData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
        });
        this.$router.push("/professional");
      } catch (error) {
        console.error("Error registering:", error.response ? error.response.data : error.message);
      }
    },
  },
  components: { navbar, footerman },
});

export default register_pro;
