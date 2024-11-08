const current_order = Vue.component("current_order", {
  props: ["current_order", "engaged"],

  template: `
    <div
      style="
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.356);
        height: max-content;
        padding: 20px;
        width:70%
      "
    >
      <div style="font-size: 30px; margin:20px">Your Order . . .</div>
      <div style="display: flex">
        <div style="width: 75%; margin-left:0.4in">
          <div class="container">
            <p><strong>Name:</strong> {{current_order.first_name}} {{current_order.last_name}}</p>
            <p><strong>Location:</strong> {{current_order.address}}</p>
            <p><strong>Pincode:</strong> {{current_order.pincode}}</p>
            <p><strong>Additional info:</strong> {{current_order.remarks}}</p>
          </div>
        </div>
        <div style="width: 25%">
          <center>
            <p style="font-size: 25px">Hurry Up!</p>
            <div class="clock-container" >
              <img
                
                src="/static/icons/clock icon.png"
                alt="clock"
                width="50"
                height="50"
              />
            </div>
             <button
                id="complete-button"
                @click="complete(current_order.srvcreq_id)"
              >
                complete
              </button>
          </center>
        </div>
      </div>
      <!-- Popup Overlay -->
      <div v-if="showForm" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center;" @click.self="closeForm">
        <otp_form :engaged="engaged" :service_id="current_order.srvcreq_id" @toggleengaged="toggleengaged" @close="closeForm"></otp_form>
      </div>
    </div>
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      showForm: false,
    };
  },
  created() {},
  methods: {
    closeForm() {
      this.showForm = false;
    },
    toggleengaged(value){
      this.$emit("toggleengaged", value);
    },
    async complete(service_id) {
      this.showForm = true;
      const send_otp = await axios.post("/api/sendotp",{
        service_id: service_id
      },{
        headers: {
          Authorization: "Bearer " + this.token,
        },
      })
    }


  },
});

export default current_order;
