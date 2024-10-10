const add_service = Vue.component("add-service", {
    template:  `
    <div>
        <h2>Add service</h2>
        <form @submit.prevent="submitForm" enctype="multipart/form-data">
          <div>
            <label for="service_name">Service Name:</label>
            <input type="text" id="service_name" v-model="service_name" required>
          </div>
          
          <div>
            <label for="time_req">Time Required (in minutes):</label>
            <input type="number" id="time_req" v-model="time_req" required>
          </div>
        
          <div>
            <label for="service_base_price">Base Price:</label>
            <input type="number" id="service_base_price" v-model="service_base_price" required>
          </div>
        
          <div>
            <label for="service_dscp">Service Description:</label>
            <textarea id="service_dscp" v-model="service_dscp" required></textarea>
          </div>
        
          <div>
            <label for="service_image">Service Image:</label>
            <input type="file" id="service_image" @change="onFileChange" accept=".jpg,.jpeg">
          </div>
        
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
    </div>
    `,
    data() {
        return {
            token: localStorage.getItem("token"),
            service_name: "",
            time_req: "",
            service_base_price: "",
            service_dscp: "",
            service_image: null  // This will hold the file object
        };
    },
    methods: {
        // Method to handle file input change
        onFileChange(event) {
            this.service_image = event.target.files[0];  // Get the file from input
        },

        // Submit form method to send data using FormData
        async submitForm() {
            const formData = new FormData();

            // Append the form fields to the FormData object
            formData.append("service_name", this.service_name);
            formData.append("time_req", this.time_req);
            formData.append("service_base_price", this.service_base_price);
            formData.append("service_dscp", this.service_dscp);
            
            // Append the file (service_image) if it exists
            if (this.service_image) {
                formData.append("service_image", this.service_image);
            }

            try {
                const response = await axios.post('/api/service', formData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'multipart/form-data'  // Ensure multipart/form-data is used
                    }
                });

        
                if (response.status === 201) {
                    window.location.href = '#/';  
                }
            } catch (error) {
                console.error("There was an error submitting the form:", error);
            }
        }
    }
});

export default add_service;
