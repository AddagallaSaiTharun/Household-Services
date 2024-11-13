const noti = Vue.component("noti", {
  template: `
    <div>
      <div v-if="isAdmin">
        <div v-if="notification" :class="['notification', { show: isVisible }]">
          <div class="notification-bell">
            <i class="fas fa-bell"></i>
          </div>
             {{ notification }}<a href="/">view</a>
        </div>
      </div>
    </div>

  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      isAdmin: false,
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
    async checkAdminStatus() {
      try {
        const response = await axios.get("/api/isadmin", {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.isAdmin = response.data;
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    },
    setupEventSource() {
      const source = new EventSource("http://127.0.0.1:5000/events");

      source.addEventListener(this.email, (event) => {
        const data = event.data;
        this.notification = data; 
      });


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
    await this.checkAdminStatus();
    if (this.isAdmin) {
      this.setupEventSource();
    }
  },
  beforeDestroy() {
    clearTimeout(this.hideTimeout);
  },
});

export default noti;
