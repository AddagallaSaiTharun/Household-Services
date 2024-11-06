const prohome = Vue.component("prohome", {
  template: `
    <div>
      <div v-if="verified">You are verified</div>
      <div v-else>
      <h2>
        You are not verified please wait until the Admin verifies you
        </h2>
      </div>
    </div>

    
    
    `,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
    };
  },
  methods: {

  },
  async created() {
    const response = await axios.get("api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
      params:{
        self: true
      }
    });
    const data = JSON.parse(response.data);
    if (data.message && data.message.length) {
      this.verified = true;
    }
  },
});

export default prohome;
