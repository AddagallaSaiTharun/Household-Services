import user_stats from "../components/professional/user_stats.js";
import current_order from "../components/professional/current_order.js";
import navbar from "../components/navbar.js";
import request_cards from "../components/professional/request_cards.js";
import noti from "../components/notification.js";
import footerComp from "../components/footer.js";

const Pro_view = Vue.component("prohome", {
  template: `
  <div>
  <navbar />
  <div style="font-family: Arial, sans-serif; padding: 20px">
    <div v-if="loading">
      <h2>Loading...</h2>
    </div>
    <div v-else-if="verified">
      <div
        style="
          display: flex;
          margin-top: 10px;
          gap: 20px;
          align-items: flex-start;
        "
      >
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
          <request_cards :current="current_orders" />
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
      <noti></noti>
    </div>
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
  <footerComp />
</div>`,
  data() {
    return {
      username: localStorage.getItem("user"),
      token: localStorage.getItem("token"),
      verified: false,
      email: localStorage.getItem("email"),
      engaged: false,
      current_orders: [],
      loading: true,
    };
  },

  methods: {
    toggleengaged(value) {
      this.engaged = value;
    },
  },

  children: {noti},

  async beforeMount() {
    try {
      const response = await axios.get("/api/professional", {
        headers: {
          Authorization: "Bearer " + this.token,
        },
        params: {
          self: true,
        },
      });
      const data = JSON.parse(response.data).message[0];
      if (data && data.prof_ver === 1) {
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
        this.engaged = true;
        this.current_orders = JSON.parse(engaged.data).message;
        this.current_orders.reverse();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.loading = false; 
    }
  },
  components: { navbar, user_stats, current_order, request_cards, footerComp },
});

export default Pro_view;
