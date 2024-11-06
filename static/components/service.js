const service = Vue.component("service", {
  template: `
    <div style="margin: 0.5in">
      <div v-if="service" style="font-size: 40px">
        {{ service.service_name }}
      </div>
      <div style="display: flex; justify-content: space-evenly">
        <div style="width: 20%">
          <img style="width: 100%; border-radius: 20px" :src="'/static/images/' + service_id + '.jpg'" alt="" />
        </div>
        <div style="width: 76%">
          <div
            style="
              border: 3px red solid;
              margin: 0 10px 0 10px;
              padding:0 20px;
              border-radius: 20px;
            "
          >
            <h1>The Service includes</h1>
            <div class="step">
              <p class="method">🌟Identify the primary cause of the issue.</p>
            </div>

            <div class="step">
              <p class="method">
                🌟Confirm any issues identified in the diagnostics.
              </p>
            </div>

            <div class="step">
              <p class="method">🌟Restore full functionality via the Service.</p>
            </div>

            <div class="step">
              <p class="method">
                🌟Confirm the issue is resolved, and the machine operates like new.
              </p>
            </div>

            <div class="step">
              <p class="method">
                🌟Ensure customer satisfaction and deliver a product in top
                condition.
              </p>
            </div>
          </div>
        </div>
      </div>
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
    `,

  data() {
    return {
      token: localStorage.getItem("token"),
      service_id: this.$route.params.id,
      service: undefined,
      pros: [],
    };
  },

  async created() {
    this.service = await axios.get("/api/service", {
      params: {
        service_id: this.service_id,
      },
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    this.service = JSON.parse(this.service.data).content[0];

    const pros = await axios.get("api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
      params: {
        prof_srvcid: this.service_id,
      },
    });
    this.pros = JSON.parse(pros.data).message;
  },
});

export default service;
