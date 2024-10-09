const Home = Vue.component("home-component", {
  template: `
    <div style="display: flex;">
      <div class="left" style="width: 60%;">asdasd</div>
      
      <div class="right" style="width: 40%;">
        <center>
          <h2>What are you looking for?</h2>
        </center>

        <div class="grid-container" style="display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: auto; gap: 10px;">
          <div v-for="service in services" :key="service.id" class="grid-item" style="height: 2in; margin: 3px;background-color: aqua;">
            <center>{{ service.name }}</center>
          </div>              
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      // services: []
      services: [
        { name: "Web Development" },
        { name: "Graphic Design" },
        { name: "SEO Optimization" },
        { name: "Content Writing" },
        { name: "Digital Marketing" },
        { name: "Mobile App Development" },
        { name: "Cloud Services" },
        { name: "UI/UX Design" }
      ]
      // demo data
    };
  },
  async created() {
    if (!this.token) {
      window.location.href = "/#/login";
    }

    try {
      const response = await axios.get('/api/services', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });

      // Set the fetched data to services
      this.services = response.data;
    } catch (error) {
      console.error('Error fetching service data:', error);
    }
  },
});

export default Home;
