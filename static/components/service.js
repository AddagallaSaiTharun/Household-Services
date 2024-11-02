const service = Vue.component("service", {
  template: `
    <div>
        <!-- Display service name if available -->
        <div v-if="service">
            {{ service.service_name }}
        </div>

        <!-- Loop through professionals and display them in card view -->
        <div v-if="pros.length">
            <div v-for="pro in pros" :key="pro.prof_userid" class="pro-card">
                <p><strong>Professional ID:</strong> {{ pro.prof_userid }}</p>
                <p><strong>Experience:</strong> {{ pro.prof_exp }} years</p>
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

    for (var pro in this.pros) {
      console.log(this.pros[pro]);
    }
    for (var pro in this.pros) {
      const name = await axios.get("api/user", {
        params: {
          user_id: pros[pro].prof_userid,
        },
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
    }
  },
});

export default service;
