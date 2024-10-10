const Home = Vue.component("home-component", {
  template: `

  <div>
  <div>
    <div v-if="isAdmin" style="display: flex">
      <admin-home style="width: 60%"></admin-home>
      <div class="right" style="width: 40%">
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
            height: 2in;
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
              justify-content: space-evenly;
              background-color: grey;
              border: none;
              border-radius: 10px;
            "
          >
            <div style="width: 2in; height: 1.3in">
              <img
                style="width: 1.3in; height: 100%; border-radius:0 0 0 10px;"
                :src="'data:image/jpeg;base64,' + service.service_image"
                class="card-img-top"
                alt="Service Image"
              />
            </div>
            <div style="margin: 5px">
              <center>
                <h3>{{ service.service_name }}</h3>
              </center>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="!isAdmin">
    <div style="display: flex">
      <div class="left" style="width: 60%">asdasd</div>

      <div class="right" style="width: 40%">
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
              justify-content: space-evenly;
              background-color: grey;
              border: none;
              border-radius: 10px;
            "
          >
            <div style="width: 2in; height: 1.3in">
              <img
                style="width: 1.3in; height: 100%; border-radius:0 0 0 10px;"
                :src="'data:image/jpeg;base64,' + service.service_image"
                class="card-img-top"
                alt="Service Image"
              />
            </div>
            <div style="margin: 5px">
              <center>
                <h3>service.service_name</h3>
              </center>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


  `,
  data() {
    return {
      username: localStorage.getItem("user"),
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
      const response = await axios.get("/api/isadmin", {
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
      this.isAdmin = response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
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
});

export default Home;
