const request_cards = Vue.component("request_cards", {
  props: ["current"],
  template: `
  <div
      class="customer_requests"
      style="padding: 20px; font-family: Arial, sans-serif"
    >
      <div style="font-size: 30px; font-weight: bold; color: #333">
        Requests
      </div>

      <div
        v-if="requests.length"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
          gap: 10px;
          scale: 0.95;
        "
      >
        <div v-for="request in pending_requests" :key="request.srvcreq_id">
          <div v-if="request.srvc_status == 'pending'">
            <div
              class="pro-card"
              style="
                height: min-content;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                padding: 20px;
                text-align: center;
                transition: transform 0.2s ease;
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin-bottom: 15px;
                "
              >
                <img
                  width="60%"
                  src="/static/icons/profile_big.jpg"
                  alt="Profile Image"
                  style="border-radius: 50%"
                />
              </div>

              <p style="font-size: 16px; color: #333; margin: 10px 0">
                <strong>Name:</strong> {{ request.first_name }} {{
                request.last_name }}
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0">
                <strong>Phone no:</strong> {{ request.phone }}
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0">
                <strong>Location:</strong> {{ request.address }}
              </p>
              <p style="font-size: 16px; color: #333; margin: 10px 0">
                <strong>Start Date:</strong> {{ request.date_srvcreq }}
              </p>


              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  gap: 10px;
                  margin-top: 20px;
                "
              >
                <button
                  id="accept-button"
                  @click="accept(request.srvcreq_id)"
                  style="
                    background-color: #4c6faf;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                  "
                >
                  Accept
                </button>
                <button
                  id="reject-button"
                  @click="reject(request.srvcreq_id)"
                  style="
                    background-color: #ff776d;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                  "
                >
                  Reject
                </button>
              </div>
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
