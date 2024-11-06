const prohome = Vue.component("prohome", {
  template: `
    <div>
      <div v-if="verified">
        <div style="font-size: 30px">
            Professionals
          </div>
          <div v-if="pros.length">
            <div
              v-for="pro in pros"
              :key="pro.prof_userid"
              class="pro-card"
              style="height: max-content"
            >
              <div
                style="
                  justify-content: space-around;
                  align-items: center;
                  display: flex;
                "
              >
                <img width="90%" src="/static/icons/profile_big.jpg" alt="" />
              </div>

              <p><strong>Professional ID:</strong> {{ pro.prof_userid }}</p>
              <p><strong>Name:</strong> {{ pro.username }}</p>
              <p><strong>Experience:</strong> {{ pro.prof_exp }} years</p>
              <button @click=book()>Book Now</button>
            </div>
            
          </div>
          
      
      </div>
      <div v-else>
      <h2>
        You are not verified please wait until the Admin verifies you
        </h2>
      </div>
    </div>
    `,
  data() {
    return {
      usernamer: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
    };
  },
  methods: {
    verify() {
        return 1;
    }
  },
  async created() {
    const response = await axios.get("/api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    const data = JSON.parse(response.data);
    if (data.message && data.message.length) {
      this.verified = true;
    }

  },
});

export default prohome;
