const admin_home = Vue.component("admin-home", {
  template: `
    <div>
    <h1>{{ name }}</h1>
        <h2>This is the admin page</h2>
        <button class= "btn btn-primary" @click="add_service">Add_Service</button>
        <div class="row">
            <div class="col-md-4" v-for="(pro, index) in pros" :key="index">
                <div style="display: grid; grid-template-columns: auto auto auto auto; grid-auto-rows: auto; gap: 10px; margin-top:1in">
                    <div class="card" style="width: 10rem;margin: 10px">
                        <div class="card-body">
                            <h5 class="card-title">name : {{ pro['name'] }}</h5>
                            <p class="card-text">Pro of : {{ pro['service_name'] }}</p>
                            <p class="card-text">Pro for {{ pro['prof_exp'] }} years </p>
                            <p class="card-text">description {{ pro['prof_dscp'] }}</p>
                            <button class="btn btn-primary" @click="approve_pro(pro.prof_userid)">Approve Pro</button>
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
      name: "",
 
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
    const source = new EventSource("http://127.0.0.1:5000/events");

    source.addEventListener("customer", (event) => {
      const data = JSON.parse(event.data);
      this.name = data[0].name;
    });

    source.addEventListener("error", (event) => {
      console.error("EventSource error:", event);
    });

    const requests = await axios.get("/api/requests", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    console.log(requests.data);
    const response = await axios.get("/api/professional", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    const pros = JSON.parse(response.data).message;
    for (var pro in pros) {
      if (pros[pro].prof_ver == "0") {
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
    }
  },
});

export default admin_home;
