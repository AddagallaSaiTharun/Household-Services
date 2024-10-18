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
              cursor: pointer;
            "
            @click="open_service(service.service_id)"

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
      <div class="left" style="width: 60%; padding:80px">
        <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <img style="height: 5in; border-radius: 30px;" src="/static/home_images/4.jpg" class="d-block w-100" alt="...">
          </div>
          <div class="carousel-item">
            <img style="height: 5in; border-radius: 30px;" src="/static/home_images/3.jpg" class="d-block w-100" alt="...">
          </div>
          <div class="carousel-item">
            <img style="height: 5in; border-radius: 30px;" src="/static/home_images/2.jpg" class="d-block w-100" alt="...">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
      </div>

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
              cursor: pointer;
            "
            @click="open_service(service.service_id)"
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
  methods: {
    open_service(id) {
      window.location.href = "/#/service/" + id;
    },
  },
});

export default Home;
