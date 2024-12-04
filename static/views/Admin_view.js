import Navbar from "../components/navbar.js";
import Notification from "../components/notification.js";

const AdminHome = Vue.component("admin-home", {
  template: `
    <div>
      <navbar />
      <noti></noti>
      <div
        class = "row row-cols-4 row-cols-lg-5 g-5 m-5 "
      >
        <div class="col" v-for="([id,professional], index) in professionals" :key="index">
            <div class="card">
              <div class="card-body">
                <center>
                  <img src="static/icons/profile_big.jpg" alt="Profile Image" class="card-img-top">
                  <h5 class="card-title">Name: {{ professional.username }}</h5>
                  <p class="card-text">Service: {{ professional.service_name }}</p>
                  <p class="card-text">Experience: {{ professional.prof_exp }} years</p>
                  <p class="card-text">Description: {{ professional.prof_dscp }}</p>
                  <button class="btn btn-primary" @click="approveProfessional(userId)">Approve Pro</button>
                </center>
              </div>
            </div>
          </div>
      </div>
    </div>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      professionals: new Map(),
    };
  },
  methods: {
    async approveProfessional(userId) {
      try {
        // Send the approval request to the server
        await axios.put(
          "/api/professional",
          { prof_userid: userId, prof_ver: "1" },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        // Remove the professional from the map after approval
        this.professionals.delete(userId);
      } catch (error) {
        console.error("Error approving professional:", error);
      }
    },
    async loadProfessionals() {
      try {
        const response = await axios.get("/api/professional", {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { prof_ver: 0 }
        });

        // Populate the professionals map with the response data
        const professionalsData = JSON.parse(response.data).message;
        console.log(professionalsData);
        this.professionals = new Map(
          professionalsData.map(professional => [professional.prof_userid, professional])
        );
      } catch (error) {
        console.error("Error loading professionals:", error);
      }
    },
  },
  async created() {
    await this.loadProfessionals();
  },
  components: { Navbar, Notification },
});

export default AdminHome;