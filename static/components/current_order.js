const current_order = Vue.component("current_order", {
  props: ["current_order", "engaged"],

  template: `
    <div style="margin: 30px;">
      <div>
        <div style="font-size: 30px; margin: 20px">Your Order . . .</div>
        <div
          style="
            height: 0.9in;
            background-color: rgba(236, 236, 236, 0.575);
          "
        >
          <div style="display: flex; width: 100%">
            <img
              style="
                width: 30%;
                background-color: transparent;
                border: none;
                border-radius: 50%;
                margin: 20px;
              "
              src="/static/icons/profile_big.jpg"
              alt=""
            />
            <div>
              <h2 style="font-size: 25px">
                {{current_order.first_name}} {{current_order.last_name}}
              </h2>
              <h3 style="font-size: 14px">
                {{current_order.first_name}} {{current_order.last_name}}
              </h3>
            </div>
          </div>

          <div style="padding-left: 30px; padding-right: 30px">
            <div
              style="
                background-color: white;
                padding: 20px;
                border: 3px solid rgb(172, 149, 255);
                box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.418);
              "
            >
              <div style="width: 75%">
                <div>
                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/clipboard.png"
                        alt=""
                      />
                    </div>
                    <div class="name">Order:</div>
                    <div class="value">Ro repair</div>
                  </div>

                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/calendar.png"
                        alt=""
                      />
                    </div>
                    <div class="name">date</div>
                    <div class="value">2024-1-1</div>
                  </div>
                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/location.png"
                        alt=""
                      />
                    </div>
                    <div class="name">Location:</div>
                    <div class="value">{{current_order.address}}</div>
                  </div>
                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/pincode.png"
                        alt=""
                      />
                    </div>
                    <div class="name">Pincode:</div>
                    <div class="value">{{current_order.pincode}}</div>
                  </div>
                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/globe.png"
                        alt=""
                      />
                    </div>
                    <div class="name">Address link:</div>
                    <div class="value">https://maps.google.com</div>
                  </div>
                  <div class="detailcontainer">
                    <div class="icon">
                      <img
                        style="width: 60%"
                        src="/static/icons/notes.png"
                        alt=""
                      />
                    </div>
                    <div class="name">Remarks:</div>
                    <div class="value">{{current_order.remarks}}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <center>
            <button
              style="
                margin: 10px;
                height: 0.5in;
                width: 1in;
                border: none;
                background-color: rgb(172, 149, 255);
                border-radius: 10px;
                font-size: 16px;
                font-weight: 200;
              "
              id="complete-button"
              @click="complete(current_order.srvcreq_id)"
            >
              complete
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
