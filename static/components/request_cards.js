const request_cards = Vue.component("request_cards", {
  template: `
    <div class="customer_requests">
      <div style="font-size: 30px">Requests</div>
      <div
        v-if="requests.length "
        style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          
        "
      >
        <div v-for="request in pending_requests" :key="request.srvcreq_id">
          <div v-if="request.srvc_status == 'pending'">
            <div class="pro-card" style="height: max-content; scale: 0.8">
              <center>
                <div
                  style="
                    justify-content: space-around;
                    align-items: center;
                  "
                >
                  <img width="60%" src="/static/icons/profile_big.jpg" alt="" />
                </div>
                <p>
                  <strong>Name:</strong> {{ request.first_name }} {{
                  request.last_name }}
                </p>
                <p><strong>Phone no:</strong> {{ request.phone }}</p>
                <p><strong>Location:</strong> {{ request.address }}</p>
                <p><strong>Start Date:</strong> {{ request.date_srvcreq }}</p>
                <p><strong>End Date:</strong> {{ request.date_cmpltreq }}</p>
                <div id="status"></div>
                <button id="accept-button" @click="accept(request.srvcreq_id)">
                  Accept
                </button>
                <button id="reject-button" @click="reject(request.srvcreq_id)">
                  Reject
                </button>
              </center>
            </div>
          </div>
          <div v-else>
            
          </div>
        </div>
      </div>
    </div>
    
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      requests: [],
      pending_requests: [],
    };
  },
  methods: {
    async accept(service_id) {
      if (confirm("Are you sure you want to accept the service?")) {
        const res = await axios.put(
          "/api/srvcreq",
          {
            srvcreq_id: service_id,
            srvc_status: "accepted",
          },
          {
            headers: {
              Authorization: "Bearer " + this.token,
            },
          }
        );
        this.$emit("toggleengaged", !this.engaged);
        window.location.reload();
      }
    },
    async reject(service_id) {
      if (confirm("Are you sure you want to reject the service?")) {
        const res = await axios.put(
          "/api/srvcreq",
          {
            srvcreq_id: service_id,
            srvc_status: "rejected",
          },
          {
            headers: {
              Authorization: "Bearer " + this.token,
            },
          }
        );
        window.location.reload();
      }
    },
  },
  async created() {
    const requests = await axios.get("/api/srvcreq", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    this.requests = JSON.parse(requests.data).message;
    for (const request of this.requests) {
      if (request.srvc_status == "pending") {
        this.pending_requests.push(request);
      }
    }
  },
});

export default request_cards;
