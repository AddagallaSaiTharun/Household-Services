const prohome = Vue.component("prohome", {
  template: `
  <div>
      <div>
        <div v-if="verified">
          <div class="user_stats" style="display: flex; justify-content: space-around; margin-top:10px">
            <div style="width: 68%">
              <user_stats></user_stats>
            </div>
            <div style="width: 28%">
              <current_order></current_order>
            </div>
          </div>
          <div class="customer_requests">
            <div style="font-size: 30px">Requests</div>
            <div
              v-if="requests.length"
              style="display: flex; flex-wrap: wrap; gap: 10px"
            >
              <div
                v-for="request in requests"
                :key="request.srvcreq_id"
                class="pro-card"
                style="height: max-content; scale:0.8"
              >
                <center>
                  <div
                    style="
                      justify-content: space-around;
                      align-items: center;
                      display: flex;
                    "
                  >
                    <img
                      width="60%"
                      src="/static/icons/profile_big.jpg"
                      alt=""
                    />
                  </div>
                  <p><strong>Name:</strong> {{ request.first_name }} {{ request.last_name }}</p>
                  <p><strong>Phone no:</strong> {{ request.phone }}</p>
                  <p><strong>Location:</strong> {{ request.address }}</p>
                  <p><strong>Start Date:</strong> {{ request.date_srvcreq }}</p>
                  <p><strong>End Date:</strong> {{ request.date_cmpltreq }}</p>
                  <div id="status"></div>
                  <button id="accept-button" @click="accept(request.srvcreq_id)">Accept</button>
                  <button id="reject-button" @click="reject(request.srvcreq_id)">Reject</button>
                </center>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <h2>You are not verified please wait until the Admin verifies you</h2>
        </div>

        <div v-if="notification" :class="['notification', { show: isVisible }]">
          <div class="notification-bell">
            <i class="fas fa-bell"></i>
          </div>
          {{notification.msg}}<a href="/">view</a>
        </div>

      </div>
    </div>
  
    `,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
      requests: [],
      notification: null,
      isVisible: false,
      hideTimeout: null,
      
    };
  },
  watch: {
    notification(newValue) {
      if (newValue) {
        this.showNotification();
      }
    },
  },
  methods: {
    setupEventSource() {
      const source = new EventSource("http://127.0.0.1:5000/events");

      source.addEventListener("professional", (event) => {
        const data = JSON.parse(event.data);
        this.notification = data; 
      });


      source.addEventListener("error", (event) => {
        console.error("EventSource error:", event);
        source.close(); 
        setTimeout(() => this.setupEventSource(), 5000); 
      });
    },
    showNotification() {
      this.isVisible = true;
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.isVisible = false;
      }, 10000); 
    },
    async accept(service_id){
      const res = await axios.put("/api/srvcreq",
        {
          srvcreq_id: service_id,
          srvc_status: 'accepted'
        }
      ,{
        headers: {
          Authorization: "Bearer " + this.token,
        },
        
      })
    },
    async reject(service_id){      
      const res = await axios.put("/api/srvcreq",
        {
          srvcreq_id: service_id,
          srvc_status: 'rejected'
        },{
        headers: {
          Authorization: "Bearer " + this.token, 
        },
      })

      document.getElementById("accept-button").remove();
      document.getElementById("reject-button").remove();
      document.getElementById("status").innerHTML = "Request Rejected"
    }
  },

  beforeDestroy() {
    clearTimeout(this.hideTimeout);
  },
  async created() {
    this.setupEventSource();
    
    const response = await axios.get("/api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
      params:{
        self: true
      }
    });
    const data = JSON.parse(response.data).message[0];
    if (data != null && data.prof_ver == 1) {
      this.verified = true;
    }
    const requests = await axios.get("/api/srvcreq",{
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    this.requests = JSON.parse(requests.data).message
  
  },
});

export default prohome;
