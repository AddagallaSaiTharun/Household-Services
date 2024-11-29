import user_stats from "../components/professional/user_stats.js";
import current_order from "../components/professional/current_order.js";
import navbar from "../components/navbar.js";
import pro_navbar from "../components/pro_navbar.js";
import request_cards from "../components/professional/request_cards.js";
import otp_form from "../components/professional/otp_form.js";
import noti from "../components/notification.js";

const Pro_view = Vue.component("prohome", {
  template: `
  <div>
    <pro_navbar />
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
        <noti></noti>
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
</div>
    `,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
      email: localStorage.getItem("email"),
      engaged: false,
      current_orders: [],
    };
  },

  methods: {
    toggleengaged(value) {
      this.engaged = value;
    },
  },

  children: {noti},

  async created() {

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

    if (JSON.parse(engaged.data).message.length) {
      this.engaged = !this.engaged;
    }
    for (const i of JSON.parse(engaged.data).message) {
      this.current_orders.push(i);
    }
    this.current_orders.sort(
      (a, b) => new Date(a.date_srvcreq) - new Date(b.date_srvcreq)
    );
  },
  components: { pro_navbar, user_stats, current_order, request_cards },
});

export default Pro_view;
