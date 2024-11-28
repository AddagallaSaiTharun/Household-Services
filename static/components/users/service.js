import serv_req_form from "./serv_req_form.js";
import navbar from "../navbar.js";
import footerman from "../footer.js";


const service = Vue.component("service", {
  template: `
  <div id="service">
    <navbar />
    <div style="margin: 30px; font-family: Arial, sans-serif;">
  <div v-if="service" style="font-size: 36px; font-weight: bold; color: #333; margin-bottom: 20px;">
    {{ service.service_name }}
  </div>
  
  <div style="display: flex; justify-content: space-between; gap: 20px;">
    <!-- Service Image Section -->
    <div style="width: 25%;">
      <img
        :src="'/static/images/' + service_id + '.jpg'"
        alt="Service Image"
        style="width: 100%; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
      />
    </div>
    
    <!-- Service Description Section -->
    <div style="width: 70%; padding: 20px; background-color: #f9f9f9; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="width: 100%; padding: 20px; background-color: #f9f9f9; border-radius: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
  <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Service Instructions:</h2>
  
  <div style="margin-bottom: 20px;">
    <p style="font-size: 14px; color: #555;">
      To ensure smooth service completion, please follow these steps carefully. This will help us diagnose and resolve any issues effectively and leave you satisfied with the results.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="font-size: 16px; margin-right: 10px;">1️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Identify the Primary Issue:</strong> Think about the main issue you're experiencing. Try to provide clear details about when it started and how it affects the functionality.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="font-size: 16px; margin-right: 10px;">2️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Confirm the Issue:</strong> Once diagnostics are completed, verify the issues identified. This helps us ensure all aspects of the problem are fully understood before proceeding.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="font-size: 16px; margin-right: 10px;">3️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Allow the Service to Begin:</strong> Our team will begin the repair or service. Please make sure the area is accessible, and you have any necessary information or materials prepared.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="font-size: 16px; margin-right: 10px;">4️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Monitor for Updates:</strong> We’ll confirm each stage of the service. Keep your contact information accessible in case we need to reach out for additional information or verification.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
    <span style="font-size: 16px; margin-right: 10px;">5️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Confirm Completion:</strong> Once the service is complete, verify everything works as expected. Your satisfaction is our priority, so let us know if you have any questions.
    </p>
  </div>

  <div class="step" style="display: flex; align-items: start;">
    <span style="font-size: 16px; margin-right: 10px;">6️⃣</span>
    <p style="font-size: 14px; color: #555; margin: 0;">
      <strong>Provide Feedback:</strong> After the service, you’ll have an opportunity to share feedback. Your input helps us continue delivering top-quality service.
    </p>
  </div>
</div>

    </div>
  </div>

  <!-- Professionals Section -->
  <div style="font-size: 30px; font-weight: bold; color: #333; margin-top: 40px; margin-bottom: 20px;">
    Professionals
  </div>
  
  <div v-if="pros.length" style="display: flex; flex-wrap: wrap; gap: 20px;">
    <div
      v-for="pro in pros"
      :key="pro.prof_userid"
      class="pro-card"
      style="
        width: 220px;
        padding: 20px;
        text-align: center;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 15px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
      "
      @mouseover="hoverCard(pro.prof_userid)"
      @mouseleave="leaveCard(pro.prof_userid)"
    >
      <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 15px;">
        <img src="/static/icons/profile_big.jpg" alt="Professional Image" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;"/>
      </div>
      <p style="font-size: 16px; color: #333; margin: 5px 0;">
        <strong>Professional ID:</strong> {{ pro.prof_userid }}
      </p>
      <p style="font-size: 16px; color: #333; margin: 5px 0;">
        <strong>Name:</strong> {{ pro.username }}
      </p>
      <p style="font-size: 16px; color: #333; margin: 5px 0;">
        <strong>Experience:</strong> {{ pro.prof_exp }} years
      </p>
      <button
        @click="book(pro.prof_userid)"
        style="
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
          transition: background-color 0.3s ease;
        "
      >
        Book Now
      </button>
    </div>
  </div>
  
  <!-- Popup Overlay -->
  <div
    v-if="showForm"
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    "
    @click.self="closeForm"
  >
    <serv_req_form :srvc_id="service_id" :prof_id="selectedProfId" @close="closeForm"></serv_req_form>
  </div>
</div>
    <footerman />
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
    console.log(this.pros);
  },
  components: { navbar, footerman },
});

export default service;
