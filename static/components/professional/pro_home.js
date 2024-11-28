import user_stats from "./user_stats.js";
import current_order from "./current_order.js";


const prohome = Vue.component("prohome", {
  template: `
    <div style="font-family: Arial, sans-serif; padding: 20px">
      <div v-if="verified">
        <div
          style="
            display: flex;
            margin-top: 10px;
            gap: 20px;
            align-items: flex-start;
          "
        >
          

          <!-- Current Order or Request Cards Section -->
          <div
            v-if="engaged"
            style="
              width: 35%;
              padding: 20px;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            "
          >
            <current_order
              :current_order="current_orders"
              :engaged="engaged"
              @toggleengaged="toggleengaged"
            ></current_order>
          </div>
          <div
            v-else
            style="
              width: 75%;
              padding: 20px;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            "
          >
            <request_cards :current="current_orders"></request_cards>
          </div>
          <div
            v-if="!engaged"
            style="
              width: 25%;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            "
          >
            <center>
              <user_stats></user_stats>
            </center>
          </div>
          <div
              v-if="engaged"
              style="
              width: 75%;
              background-color: #fff;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
              
            "
          >
            <request_cards :current="current_orders"></request_cards>
          </div>          
        </div>
        <!-- Notification Section -->
        <div
          v-if="notification"
          :class="['notification', { show: isVisible }]"
          style="
            position: fixed;
            height: max-content;
            top: 20px;
            right: 20px;
            background-color: #fffae6;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            font-size: 14px;
            color: #333;
          "
        >
          <div
            class="notification-bell"
            style="display: inline; margin-right: 8px"
          >
            <i class="fas fa-bell" style="color: #ff9800"></i>
          </div>
          {{ notification }}
          <a
            href="/"
            style="color: #007bff; text-decoration: none; margin-left: 5px"
            >view</a
          >
        </div>
      </div>

      <!-- Verification Message -->
      <div
        v-else
        style="
          text-align: center;
          color: #333;
          font-size: 18px;
          margin-top: 20px;
        "
      >
        <h2 style="color: #e74c3c">
          You are not verified. Please wait until the Admin verifies you.
        </h2>
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
      engaged: false,
      current_orders: [],
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
    toggleengaged(value) {
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

    const engaged = await axios.get("/api/srvcreq", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
      params: {
        srvc_status: "accepted",
      },
    });
    console.log(JSON.parse(engaged.data).message)

    if (JSON.parse(engaged.data).message.length) {
      this.engaged = !this.engaged;
    }
    for(const i of JSON.parse(engaged.data).message){
      this.current_orders.push(i);
    }
    this.current_orders.sort((a,b) => new Date(a.date_srvcreq) - new Date(b.date_srvcreq));
  },
});

export default prohome;
 