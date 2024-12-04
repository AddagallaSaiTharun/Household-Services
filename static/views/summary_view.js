import footerman from "../components/footer.js";
import navbar from "../components/navbar.js";
import noti from "../components/notification.js";

const summmary_view = Vue.component("summmary_view", {
  template: `
    <div id="summary">
      <navbar></navbar>
      <div v-if="loading">
        <h2>Loading...</h2>
      </div>
      <div v-else>
        <div class="container my-5">
          <div class="row d-flex align-items-stretch">
            
            <!-- Profile Section -->
            <div class="col-md-4 rounded h-100" style="background-color: #f8f9fa;">
              <div class="text-center mt-5 row">
                <i class="fas fa-edit edit-icon"></i>
                <div class="col-2"></div>
                <img
                  :src="profile.image || 'static/images/profile.jpeg'"
                  class="img-fluid rounded-circle col-5"
                  alt="User Profile"
                  style="width: 12vh; height: 10vh;"
                />
                <div class="col-5">
                  <h2>{{ profile.name }}</h2>
                  <p>{{ profile.username }}</p>
                </div>
              </div>
              
              <!-- Profile Details -->
              <div class="container d-flex justify-content-center mt-1 pb-5">
                <div class="profile-card">
                  <div class="profile-info">
                    <b>Profile</b>
                    <div
                      v-for="(item, index) in profileDetails"
                      :key="index"
                      :class="[
                        'info-item',
                        'd-flex',
                        'justify-content-between',
                        'align-items-center',
                        index === 0 ? 'pt-3' : ''
                      ]"
                    >
                      <div>
                        <i :class="item.icon"></i>
                        <span class="answer">{{ item.label }}</span>
                      </div>
                      <span
                        v-if="item.type === 'badge'"
                        :class="item.badgeClass"
                        class="badge rounded-pill p-1"
                      >
                        {{ item.value }}
                      </span>
                      <span v-else>{{ item.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-1"></div>
            
            <!-- Overview and Activity Log -->
            <div class="col-md-7 card ps-5 py-3">
              <h5>Overview</h5>
              <div class="activity-log">
                <!-- Overview Stats -->
                <div class="d-flex justify-content-between mb-2">
                  <div
                    v-for="(stat, index) in overviewStats"
                    :key="index"
                    class="overview-box text-center"
                  >
                    <h6>{{ stat.label }}</h6>
                    <b :class="stat.class">{{ stat.value }}</b>
                  </div>
                </div>

                <!-- Activity Log -->
                <h5>Activity Log</h5>
                <div
                  v-for="(activity, index) in activityLog"
                  :key="index"
                  class="activity-item p-0 mb-3"
                >
                  <div class="d-flex align-items-center">
                    <i :class="activity.icon + ' fa-2x me-3'"></i>
                    <div>
                      <h6>{{ activity.service }}</h6>
                      <small>{{ activity.date }}</small>
                      <p>
                        <span :class="'badge bg-' + activity.color + ' text-dark'">
                          SerReq Id: {{ activity.id }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <section class="charts mt-4 container">
          <div class="row">
            <div class="col-lg-6">
              <div class="chart-container rounded-2 p-3">
                <h3 class="fs-6 mb-3">REQUEST RESPONSE COMPLETED CHART</h3>
                <canvas id="barChart"></canvas>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="chart-container rounded-2 p-3">
                <h3 class="fs-6 mb-3">TOTAL COST CHART</h3>
                <canvas id="lineChart"></canvas>
              </div>
            </div>
          </div>
        </section>
        </div>
      <!-- Notifications and Footer -->
      <noti></noti>
      <footerman></footerman>
    </div>

  `,
  data() {
    return {
      profile: {
        image: null,
        name: null,
        username: null,
      },
      profileDetails: [],
      overviewStats: [
        { label: "Requested", value: 0, class: "display-6" },
        { label: "Completed", value: 0, class: "display-6 text-success" },
        { label: "Rejected", value: 0, class: "display-6 text-danger" },
      ],
      activityLog: [],
      loading: true,
    };
  },
  methods: {
    async fetchData(apiEndpoint) {
      try {
        const response = await axios.get(apiEndpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        return JSON.parse(response.data)["message"];
      } catch (error) {
        console.error(`Error fetching data from ${apiEndpoint}:`, error);
        return [];
      }
    },
    
    processServiceData(servdata) {
      const colorMap = {
        rejected: "danger",
        completed: "success",
        accepted: "info",
        pending: "warning",
      };
  
      let countRejected = 0;
      let countCompleted = 0;
  
      servdata.forEach((item) => {
        const status = item.srvc_status;
        if (status === "rejected") countRejected++;
        if (status === "completed") countCompleted++;
  
        this.activityLog.push({
          service: item.service_name,
          date: `${item.date_srvcreq} - ${item.date_cmpltreq || "N/A"}`,
          id: item.srvcreq_id,
          icon: "fas fa-home",
          color: colorMap[status],
        });
      });
  
      this.overviewStats[0].value = servdata.length;
      this.overviewStats[1].value = countCompleted;
      this.overviewStats[2].value = countRejected;
    },
  
    prepareChartData(data, monthNames, statusCounts) {
      data.forEach((item) => {
        const monthIndex = new Date(item.date_srvcreq || item.date_cmpltreq).getMonth();
        const month = monthNames[monthIndex];
        if (statusCounts[item.srvc_status]) {
          statusCounts[item.srvc_status][month]++;
        }
      });
  
      return monthNames.map((month) => ({
        requested: Object.values(statusCounts).reduce((sum, status) => sum + status[month], 0),
        ...Object.fromEntries(
          Object.keys(statusCounts).map((status) => [status, statusCounts[status][month]])
        ),
      }));
    },
  
    renderBarChart(data, labels) {
      new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Requested", data: data.map((d) => d.requested), backgroundColor: "#808080", barPercentage: 0.4 },
            { label: "Pending", data: data.map((d) => d.pending), backgroundColor: "#FFA500", barPercentage: 0.4 },
            { label: "Rejected", data: data.map((d) => d.rejected), backgroundColor: "#dc3545", barPercentage: 0.4 },
            { label: "Accepted", data: data.map((d) => d.accepted), backgroundColor: "#0d6efd", barPercentage: 0.4 },
            { label: "Completed", data: data.map((d) => d.completed), backgroundColor: "#28a745", barPercentage: 0.4 },
          ],
        },
        options: {
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 5 } },
            x: { grid: { display: false } },
          },
        },
      });
    },
  
    renderLineChart(data, labels) {
      new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Accepted Costs", data: data.requestedCosts, borderColor: "#0d6efd", fill: false },
            { label: "Completed Costs", data: data.completedCosts, borderColor: "#28a745", fill: false },
          ],
        },
        options: {
          scales: {
            y: { ticks: { stepSize: 500 } },
            x: { grid: { display: false } },
          },
        },
      });
    },
  
    async initBarChart() {
      const rawData = await this.fetchData("/api/srvcreq");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const statusCounts = {
        completed: Object.fromEntries(monthNames.map((month) => [month, 0])),
        rejected: Object.fromEntries(monthNames.map((month) => [month, 0])),
        pending: Object.fromEntries(monthNames.map((month) => [month, 0])),
        accepted: Object.fromEntries(monthNames.map((month) => [month, 0])),
      };
  
      const chartData = this.prepareChartData(rawData, monthNames, statusCounts);
      this.renderBarChart(chartData, monthNames);
    },
  
    async initLineChart() {
      const rawData = await this.fetchData("/api/srvcreq");
      const requestedCosts = Array(12).fill(0);
      const completedCosts = Array(12).fill(0);
  
      rawData.forEach((item) => {
        const requestMonth = item.srvc_status === "accepted" ? new Date(item.date_srvcreq).getMonth() : null;
        const completeMonth = item.srvc_status === "completed" ? new Date(item.date_cmpltreq).getMonth() : null;
  
        if (requestMonth !== null) requestedCosts[requestMonth] += item.cost;
        if (completeMonth !== null) completedCosts[completeMonth] += item.cost;
      });
  
      this.renderLineChart({ requestedCosts, completedCosts }, ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
    },
  
    async initStats() {
      const userData = await this.fetchData("/api/user");
      const servData = await this.fetchData("/api/srvcreq");
  
      // Set profile details
      const { first_name, last_name, email, user_image_url, address, age, phone, gender } = userData;
      this.profile = { name: `${first_name} ${last_name}`, username: email, image: user_image_url };
      this.profileDetails = [
        { label: "Status", value: "Active", icon: "fas fa-info-circle", type: "badge", badgeClass: "text-bg-success px-2" },
        { label: "Location", value: address.split(",").pop(), icon: "fas fa-map-marker-alt" },
        { label: "Age", value: age, icon: "fas fa-calendar-alt" },
        { label: "Phone", value: phone, icon: "fas fa-phone" },
        { label: "Gender", value: gender, icon: "fas fa-venus-mars" },
      ];
  
      // Process service data
      this.processServiceData(servData);
    },
  },
  mounted() {
    this.loading = true; // Show loading initially
    this.initStats()
      .then(() => {
        // Only after stats and data are fully fetched, initialize the charts
        this.initBarChart();
        this.initLineChart();
      })
      .finally(() => {
        this.loading = false; // Hide loading after charts are initialized
      });
  },  
  components: { footerman, navbar, noti },
  
});
export default summmary_view;
