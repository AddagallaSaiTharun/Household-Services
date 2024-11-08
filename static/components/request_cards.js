const request_cards = Vue.component("request_cards", {
  template: `
    <div class="customer_requests">
            <div style="font-size: 30px">Requests</div>
            <div
              v-if="requests.length "
              style="display: flex; flex-wrap: wrap; gap: 10px"
            >
              <div v-for="request in requests" :key="request.srvcreq_id">
                <div v-if="request.srvc_status == 'pending'">
                  <div class="pro-card" style="height: max-content; scale: 0.8">
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
                      <p>
                        <strong>Name:</strong> {{ request.first_name }} {{
                        request.last_name }}
                      </p>
                      <p><strong>Phone no:</strong> {{ request.phone }}</p>
                      <p><strong>Location:</strong> {{ request.address }}</p>
                      <p>
                        <strong>Start Date:</strong> {{ request.date_srvcreq }}
                      </p>
                      <p>
                        <strong>End Date:</strong> {{ request.date_cmpltreq }}
                      </p>
                      <div id="status"></div>
                      <button
                        id="accept-button"
                        @click="accept(request.srvcreq_id)"
                      >
                        Accept
                      </button>
                      <button
                        id="reject-button"
                        @click="reject(request.srvcreq_id)"
                      >
                        Reject
                      </button>
                    </center>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      requests: [],
    };
  },
  methods: {
    async accept(service_id) {
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
    },
    async reject(service_id) {
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

      document.getElementById("accept-button").remove();
      document.getElementById("reject-button").remove();
      document.getElementById("status").innerHTML = "Request Rejected";
    },
  },
  async created() {
    const requests = await axios.get("/api/srvcreq", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    this.requests = JSON.parse(requests.data).message;
  },
});

export default request_cards;
