const current_order = Vue.component("current_order", {
  props: ["current_order", "engaged"],

  template: `
    <div style="margin: 30px; font-family: Arial, sans-serif;">
  <div>
    <div style="font-size: 30px; margin: 20px; color: #333; font-weight: bold;">Your Order . . .</div>
    
    <div
      style="
        background-color: #f9f9f9;
        border-radius: 10px;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        padding: 20px;
      "
    >
      <div style="display: flex; align-items: center; width: 100%;">
        <img
          style="
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 50%;
            margin-right: 20px;
          "
          src="/static/icons/profile_big.jpg"
          alt="Profile Image"
        />
        
        <div>
          <h2 style="font-size: 24px; color: #333; margin: 0;">
            {{current_order.first_name}} {{current_order.last_name}}
          </h2>
          <h3 style="font-size: 16px; color: #777; margin-top: 5px;">
            {{current_order.first_name}} {{current_order.last_name}}
          </h3>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div
          style="
            background-color: #fff;
            padding: 20px;
            border: 2px solid #ac95ff;
            border-radius: 8px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          "
        >
          <div style="width: 100%;">
            <div class="detailcontainer" style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/clipboard.png"
                  alt="Order Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Order:</div>
              <div class="value" style="color: #555;">Ro repair</div>
            </div>

            <div class="detailcontainer" style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/calendar.png"
                  alt="Calendar Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Date:</div>
              <div class="value" style="color: #555;">2024-1-1</div>
            </div>

            <div class="detailcontainer" style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/location.png"
                  alt="Location Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Location:</div>
              <div class="value" style="color: #555;">{{current_order.address}}</div>
            </div>

            <div class="detailcontainer" style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/pincode.png"
                  alt="Pincode Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Pincode:</div>
              <div class="value" style="color: #555;">{{current_order.pincode}}</div>
            </div>

            <div class="detailcontainer" style="display: flex; align-items: center; margin-bottom: 15px;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/globe.png"
                  alt="Globe Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Address link:</div>
              <div class="value" style="color: #555;">
                <a href="https://maps.google.com" target="_blank" style="color: #007bff; text-decoration: none;">Google Maps</a>
              </div>
            </div>

            <div class="detailcontainer" style="display: flex; align-items: center;">
              <div class="icon" style="margin-right: 10px;">
                <img
                  style="width: 24px;"
                  src="/static/icons/notes.png"
                  alt="Notes Icon"
                />
              </div>
              <div class="name" style="flex: 1; font-weight: bold;">Remarks:</div>
              <div class="value" style="color: #555;">{{current_order.remarks}}</div>
            </div>
          </div>
        </div>
      </div>
      
      <center>
        <button
          style="
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #ac95ff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            transition: background-color 0.3s ease;
          "
          id="complete-button"
          @click="complete(current_order.srvcreq_id)"
        >
          Complete
        </button>
      </center>
    </div>
  </div>

  <!-- Popup Overlay -->
  <div
    v-if="showForm"
    style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    "
    @click.self="closeForm"
  >
    <otp_form
      :engaged="engaged"
      :service_id="current_order.srvcreq_id"
      @toggleengaged="toggleengaged"
      @close="closeForm"
    ></otp_form>
  </div>
</div>

    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      showForm: false,
      showratingForm: false
    };
  },
  created() {},
  
  methods: {
    closeForm() {
      this.showForm = false;
    },
    toggleengaged(value) {
      this.$emit("toggleengaged", value);
    },
    async complete(service_id) {
      this.showForm = true;
      const send_otp = await axios.post(
        "/api/sendotp",
        {
          service_id: service_id,
        },
        {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        }
      );
    },
    
  },
});

export default current_order;
