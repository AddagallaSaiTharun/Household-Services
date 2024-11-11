const user_stats = Vue.component("user_stats", {
  template: `
    <div
      style="
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.356);
        height:100%
      "
    >
      <div style="font-size: 30px; margin: 0 0 0 30px">Your Stats</div>
      <div style="margin: 0.6in;padding-bottom: 0.6in;">
        <div class="stat_container">
          <div>
            <div
              style="
                height: 1in;
                background-color: rgba(255, 0, 0, 0.185);
                position: relative;
              "
            >
            <div class="user_stats1">
              Rejected
            </div>

              <div class="user_stats">{{ rejected }}</div>
            </div>
          </div>
        </div>
        <div class="stat_container">
          <div>
            <div
              style="
                height: 1in;
                background-color: rgba(0, 0, 0, 0.103);
                position: relative;
              "
            >
              <div class="user_stats1">
                Completed
              </div>
              <div class="user_stats">{{  completed }}</div>
            </div>
          </div>
        </div>
        <div class="stat_container">
          <div>
            <div
              style="
                height: 1in;
                background-color: rgba(0, 255, 13, 0.24);
                position: relative;
                align-items: center;
              "
            >
            
              <div class="user_stats1">
                total requests
              </div>
              <div class="user_stats">
                {{ total }}
      
              </div>
              <p></p>
            </div>
          </div>
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
});

export default user_stats;
