import user_stats from "./user_stats.js";
import current_order from "./current_order.js";

const prohome = Vue.component("prohome", {
  template: `
    <div>
      <div v-if="verified">
        <div
          class="user_stats"
          style="display: flex; justify-content: space-around; margin-top: 10px"
        >
          <div class="user_stats" style="width: 100%">
            <user_stats></user_stats>
          </div>
        </div>
        <div v-if="engaged">
          <current_order :current_order="current_order" :engaged="engaged" @toggleengaged="toggleengaged"></current_order>
        </div>
        <div v-else>
          <request_cards></request_cards>
        </div>
        <div v-if="notification" :class="['notification', { show: isVisible }]">
          <div class="notification-bell">
            <i class="fas fa-bell"></i>
          </div>
          {{notification}}<a href="/">view</a>
        </div>
      </div>

      <div v-else>
        <h2>You are not verified please wait until the Admin verifies you</h2>
      </div>
    </div>
    `,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
      notification: null,
      isVisible: false,
      hideTimeout: null,
      email: localStorage.getItem("email"),
      engaged:false,
      current_order:null,
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
    toggleengaged(value){
      this.engaged = value;
    },
    setupEventSource() {
      const source = new EventSource("http://127.0.0.1:5000/events");
      source.addEventListener(this.email, (event) => {
        const data = event.data;
        this.notification = data;
      });
      source.addEventListener("error", (event) => {
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
  },
  children: {
    user_stats,
    current_order,
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
      params: {
        self: true,
      },
    });
    const data = JSON.parse(response.data).message[0];
    if (data != null && data.prof_ver == 1) {
      this.verified = true;
    }

    const engaged = await axios.get("/api/srvcreq",{
      headers: {
        Authorization: "Bearer " + this.token,
      },
      params: {
        srvc_status : "accepted"
      },
    })
    
    if(JSON.parse(engaged.data).message.length){
      this.engaged = !this.engaged;
    }
    this.current_order = JSON.parse(engaged.data).message[0];
  },
});

export default prohome;
