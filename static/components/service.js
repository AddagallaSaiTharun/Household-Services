import serv_req_form from "./serv_req_form.js";
const service = Vue.component("service", {
  template: `
    <div style="margin: 0.5in">
      <div v-if="service" style="font-size: 40px;">
        {{ service.service_name }}
      </div>
      <div style="display: flex; justify-content: space-evenly;">
        <div style="width: 20%;">
          <img :src="'/static/images/' + service_id + '.jpg'" alt="" style="width: 100%; border-radius: 20px;" />
        </div>
        <div style="width: 76%;">
          <div style=" margin: 0 10px; padding: 0 20px; border-radius: 20px;">
            <h1 style="font-size: 24px;">The Service includes</h1>
            <div class="step" style="margin-bottom: 10px;">
              <p class="method" style="font-size: 18px;">🌟 Identify the primary cause of the issue.</p>
            </div>
            <div class="step" style="margin-bottom: 10px;">
              <p class="method" style="font-size: 18px;">🌟 Confirm any issues identified in the diagnostics.</p>
            </div>
            <div class="step" style="margin-bottom: 10px;">
              <p class="method" style="font-size: 18px;">🌟 Restore full functionality via the Service.</p>
            </div>
            <div class="step" style="margin-bottom: 10px;">
              <p class="method" style="font-size: 18px;">🌟 Confirm the issue is resolved, and the machine operates like new.</p>
            </div>
            <div class="step" style="margin-bottom: 10px;">
              <p class="method" style="font-size: 18px;">🌟 Ensure customer satisfaction and deliver a product in top condition.</p>
            </div>
          </div>
        </div>
      </div>
      <div style="font-size: 30px; margin-top: 20px;">
        Professionals
      </div>
      <div v-if="pros.length" style="display: flex; flex-wrap: wrap; gap: 10px;">
        <div v-for="pro in pros" :key="pro.prof_userid" class="pro-card" style="height: max-content; padding: 10px; text-align: center; border: 1px solid #ccc; border-radius: 10px; width: 200px;">
          <div style="justify-content: center; align-items: center; display: flex; margin-bottom: 10px;">
            <img src="/static/icons/profile_big.jpg" alt="" style="width: 60%; border-radius: 50%;" />
          </div>
          <p><strong>Professional ID:</strong> {{ pro.prof_userid }}</p>
          <p><strong>Name:</strong> {{ pro.username }}</p>
          <p><strong>Experience:</strong> {{ pro.prof_exp }} years</p>
          <button @click="book(pro.prof_userid)" style="padding: 8px 16px; background-color: blue; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Book Now
          </button>
        </div>
      </div>
      
      <!-- Popup Overlay -->
      <div v-if="showForm" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;" @click.self="closeForm">
        <serv_req_form :srvc_id="service_id" :prof_id="selectedProfId" @close="closeForm"></serv_req_form>
      </div>
    </div>
  `,
  components: {
    serv_req_form,
  },

  data() {
    return {
      token: localStorage.getItem("token"),
      service_id: this.$route.params.id,
      service: undefined,
      pros: [],
      showForm: false,
      selectedProfId: null,
    };
  },
  methods: {
    book(prof_id) {
      this.selectedProfId = prof_id;
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
    }
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
