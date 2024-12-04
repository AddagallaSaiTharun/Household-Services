import Navbar from "../navbar.js";
import Footer from "../footer.js";
import ServiceRequestForm from "./serv_req_form.js";

const ServiceDetails = Vue.component("service-details", {
  template: `
  <div id="service-details">
    <Navbar />
    <div style="margin: 30px; font-family: Arial, sans-serif;">
      <div v-if="serviceDetails" style="font-size: 36px; font-weight: bold; color: #333; margin-bottom: 20px;">
        {{ serviceDetails.service_name }}
      </div>
  
      <div style="display: flex; justify-content: space-between; gap: 20px;">
        <!-- Service Image Section -->
        <div style="width: 25%;">
          <img
            :src="'/static/images/' + serviceId + '.jpg'"
            alt="Service Image"
            style="width: 100%; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
          />
        </div>
        
        <!-- Service Description Section -->
        <div style="width: 70%; padding: 20px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="width: 100%; padding: 20px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">Service Instructions:</h2>
            <div style="margin-bottom: 20px;">
              <p style="font-size: 14px; color: #555;">
                To ensure smooth service completion, please follow these steps carefully. This will help us diagnose and resolve any issues effectively and leave you satisfied with the results.
              </p>
            </div>
            
            <div v-for="(step, index) in serviceSteps" :key="index" class="step" style="display: flex; align-items: start; margin-bottom: 15px;">
              <span style="font-size: 16px; margin-right: 10px;">{{ step.number }}</span>
              <p style="font-size: 14px; color: #555; margin: 0;">
                <strong>{{ step.title }}:</strong> {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Professionals Section -->
      <div style="font-size: 30px; font-weight: bold; color: #333; margin-top: 40px; margin-bottom: 20px;">
        Professionals
      </div>
      
      <div v-if="professionals.length" style="display: flex; flex-wrap: wrap; gap: 20px;">
        <div
          v-for="pro in professionals"
          :key="pro.prof_userid"
          class="pro-card"
          style="width: 220px; padding: 20px; text-align: center; background-color: #fff; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease;"
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
            @click="openServiceRequestForm(pro.prof_userid,pro.username)"
            style="padding: 10px 20px; background-color: #007bff; color: white; border: none; cursor: pointer; font-size: 14px; margin-top: 10px; transition: background-color 0.3s ease;"
          >
            Book Now
          </button>
        </div>
      </div>
      
      <div
        v-if="showRequestForm"
        style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;"
        @click.self="closeServiceRequestForm"
      >
        <ServiceRequestForm :srvc_id="serviceId" :prof_id="selectedProfessionalId" :serviceDetails="serviceDetails" :professionalName="selectedProfessionalName" @close="closeServiceRequestForm" />
      </div>
    </div>
    <Footer />
  </div>
  `,

  data() {
    return {
      token: localStorage.getItem("token"),
      serviceId: this.$route.params.id,
      serviceDetails: null,
      professionals: [],
      showRequestForm: false,
      selectedProfessionalId: null,
      serviceSteps: [
        { number: '1️⃣', title: 'Identify the Primary Issue', description: 'Think about the main issue you\'re experiencing. Try to provide clear details about when it started and how it affects the functionality.' },
        { number: '2️⃣', title: 'Confirm the Issue', description: 'Once diagnostics are completed, verify the issues identified. This helps us ensure all aspects of the problem are fully understood before proceeding.' },
        { number: '3️⃣', title: 'Allow the Service to Begin', description: 'Our team will begin the repair or service. Please make sure the area is accessible, and you have any necessary information or materials prepared.' },
        { number: '4️⃣', title: 'Monitor for Updates', description: 'We’ll confirm each stage of the service. Keep your contact information accessible in case we need to reach out for additional information or verification.' },
        { number: '5️⃣', title: 'Confirm Completion', description: 'Once the service is complete, verify everything works as expected. Your satisfaction is our priority, so let us know if you have any questions.' },
        { number: '6️⃣', title: 'Provide Feedback', description: 'After the service, you’ll have an opportunity to share feedback. Your input helps us continue delivering top-quality service.' }
      ]
    };
  },

  methods: {
    openServiceRequestForm(professionalId, professionalName) {
      this.selectedProfessionalId = professionalId;
      this.selectedProfessionalName = professionalName;
      this.showRequestForm = true;
    },

    closeServiceRequestForm() {
      this.showRequestForm = false;
    }
  },

  async created() {
    try {
      const serviceResponse = await axios.get("/api/service", {
        params: { service_id: this.serviceId },
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.serviceDetails = JSON.parse(serviceResponse.data).content[0];

      const professionalsResponse = await axios.get("/api/professional", {
        headers: { Authorization: `Bearer ${this.token}` },
        params: { prof_srvcid: this.serviceId }
      });
      this.professionals = JSON.parse(professionalsResponse.data).message;
    } catch (error) {
      console.error('Error loading service details or professionals:', error);
    }
  },

  components: {
    ServiceRequestForm,
    Navbar,
    Footer
  }
});

export default ServiceDetails;