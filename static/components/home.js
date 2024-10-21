const Home = Vue.component("home-component", {
  template: `

  <div>
  <div>
    <div v-if="isAdmin" style="display: flex">
      <admin-home style="width: 60%"></admin-home>
      <service_grp style="width: 40%"></service_grp>
      
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
            <img style="height: 5in; border-radius: 30px;" src="/static/images/home_images/4.jpg" class="d-block w-100" alt="...">
          </div>
          <div class="carousel-item">
            <img style="height: 5in; border-radius: 30px;" src="/static/images/home_images/3.jpg" class="d-block w-100" alt="...">
          </div>
          <div class="carousel-item">
            <img style="height: 5in; border-radius: 30px;" src="/static/images/home_images/2.jpg" class="d-block w-100" alt="...">
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
      <service_grp style="width: 40%"></service_grp>
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
