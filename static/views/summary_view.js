import footerman from "../components/footer.js";
import navbar from "../components/navbar.js";
const summmary_view = Vue.component("summmary_view", {
  template: `
    <div id="summary">
    <navbar />
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
  <div class=col-md-1></div>
  <!-- Overview and Activity Log -->
  <div class="col-md-7 card ps-5 py-3">

  <h5>Overview</h5>
  <div class="activity-log">
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
                <span class="badge bg-info text-dark">
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
            <h3 class="fs-6 mb-3">Chart Title Two</h3>
            <canvas id="lineChart"></canvas>
          </div>
        </div>
      </div>
    </section>
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
        { label: "Requested", value: null, class: "display-6" },
        { label: "Completed", value: null, class: "display-6 text-success" },
        { label: "Rejected", value: null, class: "display-6 text-danger" },
      ],
      activityLog: [],
    };
  },
  methods: {
    async initBarChart() {
      await axios.get('/api/srvcreq',{
        headers:{
          Authorization: "Bearer " + localStorage.getItem("token"),
        }
      })
      .then(response => {
        const rawData = JSON.parse(response.data)["message"];
        const statusCounts = {
          completed: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 },
          rejected: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
        };
    
        // Map month numbers to month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
        // Process the data
        rawData.forEach(item => {
          const date = new Date(item.date_srvcreq || item.date_cmpltreq);
          const month = monthNames[date.getMonth()];
    
          if (item.srvc_status === 'completed') {
            statusCounts.completed[month]++;
          } else if (item.srvc_status === 'rejected') {
            statusCounts.rejected[month]++;
          }
        });
    
        // Prepare data for Chart.js
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const completedData = labels.map(month => statusCounts.completed[month]);
        const rejectedData = labels.map(month => statusCounts.rejected[month]);
        const totalData = labels.map(month => statusCounts.completed[month] + statusCounts.rejected[month]);
    
        // Render the chart
        new Chart(document.getElementById('barChart'), {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Completed',
                data: completedData,
                backgroundColor: '#0d6efd',
                barPercentage: 0.4,
              },
              {
                label: 'Rejected',
                data: rejectedData,
                backgroundColor: '#dc3545',
                barPercentage: 0.4,
              },
              {
                label: 'Total',
                data: totalData,
                backgroundColor: '#28a745',  // You can choose another color for the 'Total' bar
                barPercentage: 0.4,
              },
            ],
          },
          options: {
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 5 } },
              x: { grid: { display: false } },
            },
          }
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    },
    initLineChart() {
      new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'Dataset 1',
              data: [4, 20, 5, 20, 5, 25, 9, 18],
              borderColor: '#0d6efd',
            },
            {
              label: 'Dataset 2',
              data: [11, 25, 10, 25, 10, 30, 14, 23],
              borderColor: '#dc3545',
            },
          ],
        },
        options: {
          scales: {
            y: { ticks: { stepSize: 12 } },
            x: { grid: { display: false } },
          },
        },
      });
    },
    async initStats(){
      let data = await axios.get("/api/user",{
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        }
      });
      data = JSON.parse(data.data)["message"];
      this.profile.name = data.first_name + " " + data.last_name;
      this.profile.username = data.email;
      this.profile.image = data.user_image_url;
      this.profileDetails.push({
        label: "Status",
        value: "Active",
        icon: "fas fa-info-circle",
        type: "badge",
        badgeClass: "text-bg-success px-2",
      });
      this.profileDetails.push({
        label: "Location",
        value: data.address.split(",")[data.address.split(",").length-1],
        icon: "fas fa-map-marker-alt",
      });
      this.profileDetails.push({
        label: "Age",
        value: data.age,
        icon: "fas fa-calendar-alt",
      });
      this.profileDetails.push({
        label: "Phone",
        value: data.phone,
        icon: "fas fa-phone",
      });
      this.profileDetails.push({
        label: "Gender",
        value: data.gender,
        icon: "fas fa-venus-mars",
      });
      let servdata = await axios.get("/api/srvcreq",{
        headers:{
          Authorization: "Bearer " + localStorage.getItem("token"),
        }
      });
      servdata = JSON.parse(servdata.data)["message"];
      this.overviewStats[0].value = servdata.length;
      let count_rejected = 0;
      let count_complete = 0;
      for(let i=0;i<servdata.length;i++){
        if(servdata[i].status=="Rejected")count_rejected+=1;
        else if(servdata[i].status=="Completed")count_complete+=1;
        this.activityLog.push({
          service: servdata[i].service_name,
          date: `${servdata[i].date_srvcreq} - ${servdata[i].date_cmpltreq}`,
          id: servdata[i].srvcreq_id,
          icon: "fas fa-home",
        })
      }
      this.overviewStats[1].value = count_complete;
      this.overviewStats[2].value = count_rejected;
    }
  },
  mounted() {
    this.initStats();
    this.initBarChart();
    this.initLineChart();
  },
  components: { footerman, navbar },
}
);
export default summmary_view;