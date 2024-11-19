const user_stats = Vue.component("user_stats", {
  template: `

  <div
      style="
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.356);
        padding: 30px;
        text-align: center;
        width: 300px;
        height: max-content;
      "
    >
      <h2 style="font-size: 24px; color: #333; margin-bottom: 20px">
        Your Stats
      </h2>

      <div :style="conicStyle">
        <!-- Center hollow effect -->
        <div
          style="
            width: 120px;
            height: 120px;
            background-color: white;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
          "
        >
          <div style="font-size: 18px; color: #333">Total</div>
          <div style="font-size: 24px; font-weight: bold; color: #4caf50">
            {{ total }}
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: left">
        <div style="display: flex; align-items: center; margin-bottom: 10px">
          <span
            style="
              width: 12px;
              height: 12px;
              background-color: rgba(255, 0, 0, 0.6);
              display: inline-block;
              margin-right: 8px;
              border-radius: 2px;
            "
          ></span>
          <span>Rejected: {{ rejected }}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px">
          <span
            style="
              width: 12px;
              height: 12px;
              background-color: rgba(0, 255, 13, 0.6);
              display: inline-block;
              margin-right: 8px;
              border-radius: 2px;
            "
          ></span>
          <span>Completed: {{ completed }}</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 10px">
          <span
            style="
              width: 12px;
              height: 12px;
              background-color: rgba(0, 0, 0, 0.2);
              display: inline-block;
              margin-right: 8px;
              border-radius: 2px;
            "
          ></span>
          <span>Pending: {{ total - rejected - completed }}</span>
        </div>
      </div>
    </div>



    
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      total:0,
      rejected:0,
      completed:0,
    };
  },
  async created() {
    const requests = await axios.get("/api/srvcreq", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    const req = JSON.parse(requests.data).message;
    this.total = req.length;
    for (const request of req) {
      if (request.srvc_status == "rejected") {
        this.rejected +=1;
      }
      if (request.srvc_status == "completed") {
        this.completed +=1;
      }
    }
  },
  computed: {
    conicStyle() {
      const totalRequests = this.total;
      const rejectedPercentage = (this.rejected / totalRequests) * 100;
      const completedPercentage = (this.completed / totalRequests) * 100;
      const pendingPercentage = 100 - rejectedPercentage - completedPercentage;
  
      return {
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: `conic-gradient(
          rgba(255, 0, 0, 0.6) 0% ${rejectedPercentage}%,
          rgba(0, 255, 13, 0.6) ${rejectedPercentage}% ${rejectedPercentage + completedPercentage}%,
          rgba(0, 0, 0, 0.2) ${rejectedPercentage + completedPercentage}% 100%
        )`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      };
    },
  },
});

export default user_stats;
