import navbar from "../components/navbar.js";
import noti from "../components/notification.js";

const admin_home = Vue.component("admin-home", {
  template: `
    <div>
    <navbar />
    <noti></noti>
    <h2>This is the admin page</h2>
    <button class="btn btn-primary" @click="add_service">Add_Service</button>
    <div style="display: grid; grid-template-columns: repeat(5, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
        <div class="col-md-4" v-for="(pro, index) in pros" :key="index">
            <div v-if="pro.prof_ver == 0">
                <div class="card" style="width: 2.8in; margin: 10px;">
                    <div class="card-body">
                      <center>
                        <img src="static/icons/profile_big.jpg" alt="">
                        <h5 class="card-title">name : {{ pro['name'] }}</h5>
                        <p class="card-text">Pro of : {{ pro['service_name'] }}</p>
                        <p class="card-text">Pro for {{ pro['prof_exp'] }} years </p>
                        <p class="card-text">description {{ pro['prof_dscp'] }}</p>
                        <button class="btn btn-primary" @click="approve_pro(pro.prof_userid)">Approve Pro</button>
                      </center>
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
      pros: [],
    };
  },
  methods: {
    approve_pro(id) {
      try {
        const res = axios.put(
          "/api/professional",
          {
            prof_userid: id,
            prof_ver: "1",
          },
          {
            headers: {
              Authorization: "Bearer " + this.token,
            },
          }
        );
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    },
    add_service() {
      window.location.href = "/#/add_service";
    },
  },
  async created() {
    const response = await axios.get("/api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    const pros = JSON.parse(response.data).message;
    for (var pro in pros) {
      const response2 = await axios.get("/api/service", {
        params: {
          service_id: pros[pro].prof_srvcid,
        },
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
      pros[pro]["service_name"] = JSON.parse(
        response2.data
      ).content[0].service_name;

      const name = await axios.get("api/user", {
        params: {
          user_id: pros[pro].prof_userid,
        },
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
      pros[pro]["name"] = JSON.parse(name.data).message[0].first_name;
      this.pros.push(pros[pro]);
    }
  },
  components: { navbar, noti },
});

export default admin_home;
