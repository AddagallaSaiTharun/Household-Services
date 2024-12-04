const navbar = Vue.component("navbar", {
  template: `
  <div class="navbar">
    <div class="logo">
      <img src="static/images/home/Image.jpg" alt="Logo" />
      Fix-Up-Crew
    </div>
    <ul class="nav-links ps-4">
    <li v-if="isPro"><RouterLink to="/professional" :class="{active: $route.path === '/professional'}">Home</RouterLink></li>
    <li v-if="isPro"><RouterLink to="/searchorders" :class="{active: $route.path === '/searchorders'}">Search</RouterLink></li>
    <li v-if="isAdmin"><RouterLink to="/admin" :class="{active: $route.path === '/admin'}">Home</RouterLink></li>
    <li v-if="isAdmin"><RouterLink to="/adminsearch" :class="{active: $route.path === '/adminsearch'}">Search</RouterLink></li>
    <li v-if="isAdmin"><RouterLink to="/add_service" :class="{active: $route.path === '/add_service'}">Add Service</RouterLink></li>
    <li v-if="!isPro && !isAdmin"><RouterLink to="/" :class="{active: $route.path === '/'}">Home</RouterLink></li>
    <li v-if="!isPro && !isAdmin"><RouterLink to="/search" :class="{active: $route.path === '/search' }">Search</RouterLink></li>
    <li v-if="!isPro && !isAdmin && token"><RouterLink to="/summary" :class="{active: $route.path === '/summary'}">Summary</RouterLink></li>
    </ul>
    <RouterLink to="/cart" v-if="!isAdmin && !isPro">
      <img src="/static/icons/trolley.png" alt="Cart" style="width: 24px; cursor: pointer; margin-right: 8px;" />
    </RouterLink>

    <div style="position: relative;" class="px-3">
      <img class="ps-1" src="/static/icons/profile.png" alt="Profile" @click="toggleprofile" style="width: 24px; cursor: pointer;" />

      <!-- Dropdown Menu -->
      <div class="ps-1" id="dropdownMenu" style="display: none; z-index: 2; position: absolute; top: 35px; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); padding: 10px; width: 150px; color: #333;">
        <RouterLink v-if="token && !isAdmin" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" to="/summary">{{ user }}</RouterLink>
        <p v-if="isAdmin" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;">{{ user }}</p>
        <div v-if="!isAdmin">
          <RouterLink v-if="!isPro" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" @click.native="regpro(); toggleprofile();" to="#">Register as a Pro</RouterLink>
          <div v-if="isPro" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;">You are a Pro</div>
        </div>
        <RouterLink v-if="token" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" @click.native="logout(); toggleprofile();" to="#">Logout</RouterLink>
        <RouterLink v-else style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" @click.native="login(); toggleprofile();" to="#">Login</RouterLink>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      isAdmin: false,
      isPro: false,
    };
  },
  computed: {
    user() {
      return localStorage.getItem("user");
    },
  },
  methods: {
    async fetchUserRoles() {
      if (this.token) {
        try {
          const adminResponse = await axios.get("/api/isadmin", {
            headers: { Authorization: "Bearer " + this.token },
          });
          this.isAdmin = adminResponse.data.message;
          const proResponse = await axios.get("/api/ispro", {
            headers: { Authorization: "Bearer " + this.token },
          });
          this.isPro = proResponse.data.message;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            this.$router.push("/login");
          }
        }
      } else {
        this.isAdmin = false;
        this.isPro = false;
      }
    },
    regpro() {
      if (this.token) {
        this.$router.push("/register_pro");
      } else {
        this.$router.push("/login");
      }
    },
    toggleprofile() {
      const dropdownMenu = document.getElementById("dropdownMenu");
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      this.token = null;
      this.$router.push("/");
    },
    login() {
      this.$router.push("/login");
    },
  },
  async created() {
    await this.fetchUserRoles();
  },
  watch: {
    token: {
      immediate: true,
      handler() {
        this.fetchUserRoles();
      },
    },
  },
});

export default navbar;
