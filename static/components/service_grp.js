const service_grp = Vue.component("service_grp", {
  template: `
    <div class="right" style="width: 40%; margin-top: 0.8in;">
        <center>
          <h2>What are you looking for?</h2>
        </center>

        <div
          class="grid-container"
          style="
            display: grid;
            grid-template-columns: auto auto;

            grid-auto-rows: auto;
            gap: 10px;
          "
        >
          <div
            v-for="service in services"
            :key="service.id"
            class="grid-item"
            style="
              height: 1.3in;
              width: 2.5in;
              margin: 3px;
              display: flex;
              box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
              border: none;
              border-radius: 10px;
              cursor: pointer;
        
            "
            @click="open_service(service.service_id)"
          >
            <div style="width: 1.3in; height: 1.3in">
              <img
                style="width: 1.3in; height: 100%; border-radius:0 0 0 10px;"
                :src="'data:image/jpeg;base64,' + service.service_image"
                class="card-img-top"
                alt="Service Image"
              />
            </div>
            <div style="margin: 5px; text-align: center;">
              <center>
                <p class="service_name">{{ service.service_name }}</p>
              </center>
            </div>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      isAdmin: null,
      services: [],
    };
  },
  async created() {
    for (service in this.services) {
    }
    if (!this.token) {
      window.location.href = "/#/login";
    }
    

    try {
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
  methods: {
    open_service(id) {
      window.location.href = "/#/service/" + id;
    },
  },
});

export default service_grp;
