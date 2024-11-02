const register_pro = Vue.component("register_pro", {
  template: `
      <div v-if="user">
        <h2>Register as a Pro</h2>
        <form @submit.prevent="registerPro">
          <h2>{{ user.first_name }}</h2>
          <div>
            <label for="experience">Exp:</label>
            <input type="text" id="experience" v-model="exp" required />
          </div>
  
          <div>
            <label for="desc">desc:</label>
            <textarea id="desc" v-model="desc" required></textarea>
          </div>

          <div>
            <label for="service_id">Service ID:</label>
            <select id="service_id" v-model="service_id" required>
              <option value="">Select a service</option>
              <option v-for="service in services" :value="service.service_id">{{ service.service_name }}</option>
            </select>
          </div>
          <div>
            <button type="submit">Register</button>
          </div>
        </form>
      </div>
    `,
  async created() {
    try {
      this.user = await axios.get("/api/user", {
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
      this.user = JSON.parse(this.user.data).message;

      const response = await axios.get("/api/service", {
        headers: {
          Authorization: "Bearer " + this.token,
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
      exp: null,
      desc: null,
      service_id: null,
      join_date: Date.now(),
      services: null,
    };
  },
  methods: {
    async registerPro() {
      const formData = new FormData();

      formData.append("prof_exp", this.exp);
      formData.append("prof_dscp", this.desc);
      formData.append("prof_srvcid", this.service_id);
      formData.append("prof_join_date", new Date().toISOString().split("T")[0]);



      try {
        const response = await axios.post(
          "/api/professional", formData,
          {
            headers: {
              Authorization: "Bearer " + this.token,
              'Content-Type': 'multipart/form-data' 
            },
          }
        )
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      } catch (error) {
        console.error(
          "Error registering:",
          error.response ? error.response.data : error.message
        );
      }
    },
  },
});

export default register_pro;
