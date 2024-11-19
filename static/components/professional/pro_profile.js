const pro_profile = Vue.component("ProfessionalProfile", {
    template: `
      <div style="font-family: Arial, sans-serif; margin: 20px auto; max-width: 800px;">
        <div style="display: flex; align-items: center; margin-bottom: 30px;">
          <img src="/static/icons/profile_big.jpg" alt="Profile Image" 
            style="width: 150px; height: 150px; border-radius: 50%; margin-right: 20px;">
          <div>
            <h1 style="margin: 0; color: #333;">{{ professional.username }}</h1>
            <p style="margin: 5px 0; color: #555;">{{ professional.prof_dscp }}</p>
            <p style="margin: 5px 0; color: #777;">Email: {{ professional.email }}</p>
            <p style="margin: 5px 0; color: #777;">Experience: {{ professional.prof_exp }} years</p>
            <p style="margin: 5px 0; color: #777;">Joined: {{ new Date(professional.prof_join_date).toLocaleDateString() }}</p>
          </div>
        </div>
  
        <div style="display: flex; justify-content: space-between; margin: 20px 0;">
          <div style="flex: 1; margin: 0 10px; padding: 20px; background-color: #f9f9f9; text-align: center; 
                      border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <h3 style="margin-bottom: 10px;">Weekly Expenses</h3>
            <p style="margin: 0; font-size: 18px; color: #333;">{{ weeklyExpenses }}</p>
          </div>
          <div style="flex: 1; margin: 0 10px; padding: 20px; background-color: #f9f9f9; text-align: center; 
                      border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <h3 style="margin-bottom: 10px;">Monthly Expenses</h3>
            <p style="margin: 0; font-size: 18px; color: #333;">{{ monthlyExpenses }}</p>
          </div>
        </div>
  
        <div>
          <h2 style="color: #444; margin-bottom: 10px;">Service Requests</h2>
          <div v-if="serviceRequests.length === 0" style="color: #777;">No service requests found.</div>
          <ul v-else>
            <li v-for="(request, index) in  topRequests" :key="request.srvcreq_id" 
                style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; margin-bottom: 10px; list-style: none; display:flex; justify-content: space-between; align-items: center;">
              <p style="margin: 0;"><strong>Date:</strong> {{ new Date(request.date_srvcreq).toLocaleDateString() }}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> {{ request.service_name }}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> {{ request.srvc_status }}</p>
              <p style="margin: 5px 0;"><strong>Rating:</strong> {{ request.prof_rating || 'N/A' }}</p>
            </li>
          </ul>
        </div>
  
        <div style="margin-top: 20px;">
          <h2 style="color: #444; margin-bottom: 10px;">Expense Trends</h2>
          <canvas id="expensesChart" style="max-width: 100%;"></canvas>
        </div>
      </div>
    `,
    data() {
      return {
        professional: {},
        serviceRequests: [],
        weeklyExpenses: 0,
        monthlyExpenses: 0,
      };
    },
    computed: {
      sortedRequests() {
        return this.serviceRequests.sort(
          (a, b) => new Date(b.date_srvcreq) - new Date(a.date_srvcreq)
        );
      },
      topRequests() {
        // Return the top 10 sorted requests
        return this.sortedRequests.slice(0, 10);
      }
    },
    methods: {
      async fetchProfessionalDetails() {
        try {
          const response = await axios.get("/api/professional", {
            params: { self: true },
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });
          this.professional = JSON.parse(response.data).message[0];
        } catch (error) {
          console.error("Error fetching professional details:", error);
        }
      },
      async fetchServiceRequests() {
        try {
          const response = await axios.get("/api/srvcreq", {
            params: { prof_id: this.professional.prof_userid },
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          });
          this.serviceRequests = JSON.parse(response.data).message;
          this.calculateExpenses();
        } catch (error) {
          console.error("Error fetching service requests:", error);
        }
      },
      calculateExpenses() {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
  
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
  
        this.weeklyExpenses = this.serviceRequests
          .filter((req) => new Date(req.date_srvcreq) >= weekAgo)
          .reduce((acc, req) => acc + parseFloat(req.service_base_price || 0), 0);
  
        this.monthlyExpenses = this.serviceRequests
          .filter((req) => new Date(req.date_srvcreq) >= monthAgo)
          .reduce((acc, req) => acc + parseFloat(req.service_base_price || 0), 0);
  
        this.renderChart();
      },
      renderChart() {
        const ctx = document.getElementById("expensesChart").getContext("2d");
        const labels = this.serviceRequests.map((req) =>
          new Date(req.date_srvcreq).toLocaleDateString()
        );
        const data = this.serviceRequests.map((req) =>
          parseFloat(req.service_base_price || 0)
        );
  
        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Expenses",
                data,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Date",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Expense Amount ($)",
                },
              },
            },
          },
        });
      },
    },
    async created() {
      await this.fetchProfessionalDetails();
      await this.fetchServiceRequests();
    },
  });
  
  export default pro_profile;
  