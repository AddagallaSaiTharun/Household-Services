const noti = Vue.component("noti", {
  name:"noti",
  template: `
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
    </div>

  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      notification: null,
      isVisible: false,
      hideTimeout: null,
      email: localStorage.getItem("email"),

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
    
    setupEventSource() {
      const source = new EventSource("http://127.0.0.1:5000/events");

      source.addEventListener(this.email, (event) => {
        const data = event.data;
        this.notification = data; 
      });
      console.log(this.notification);


      source.addEventListener("error", (event) => {
        console.error("EventSource error:", event);
        source.close(); 
        setTimeout(() => this.setupEventSource(), 5000); 
      });
    },
    showNotification() {
      this.isVisible = true;
      clearTimeout(this.hideTimeout);
      this.hideTimeout = setTimeout(() => {
        this.isVisible = false;
      }, 10000); // Hide after 5 seconds
    },
  },
  async created() {
    this.setupEventSource();
  },
  beforeDestroy() {
    clearTimeout(this.hideTimeout);
  },
});

export default noti;
