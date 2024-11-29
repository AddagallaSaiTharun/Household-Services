const pro_navbar = Vue.component("pro_navbar", {
    name: "pro_navbar",
    template: `
    <div class="navbar">
      <div class="logo">
        <img src="static/images/home/Image.jpg" alt="Logo" />
        Fix-Up-Crew
      </div>
      <ul class="nav-links ps-4">
        <li><RouterLink to="/professional" :class="{active: $route.path === '/professional'}">Home</RouterLink></li>
        <li><RouterLink to="/searchorders" :class="{active: $route.path === '/searchorders'}">Search</RouterLink></li>
        <li v-if="token"><RouterLink to="/summary" :class="{active: $route.path === '/summary'}">Summary</RouterLink></li>
      </ul>
      <div style="position: relative;" class="px-3">
        <img class="ps-1" src="/static/icons/profile.png" alt="Profile" @click="toggleprofile" style="width: 24px; cursor: pointer;" />
  
        <!-- Dropdown Menu -->
        <div class="ps-1" id="dropdownMenu" style="display: none; z-index: 2; position: absolute; top: 35px; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); padding: 10px; width: 150px; color: #333;">
          <RouterLink v-if="token" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" to="/summary">{{ user }}</RouterLink>
          <RouterLink v-if="token" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" @click.native="logout(); toggleprofile();" to="#">Logout</RouterLink>
          <RouterLink v-else style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" @click.native="login(); toggleprofile();" to="#">Login</RouterLink>
  
            <div style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;">You are a Pro</div>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        token: localStorage.getItem("token"),
      };
    },
    computed: {
      isUserLoggedIn() {
        return localStorage.getItem("user");
      },
      user() {
        return localStorage.getItem("user");
      },
    },
    methods: {
      toggleprofile() {
        const dropdownMenu = document.getElementById("dropdownMenu");
        dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
      },
      logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        this.token = null;
        this.$router.push("/");
      },
      login() {
        this.$router.push("/login");
      },
    },
    async Created() {
      if (this.token) {
        try {
          const response = await axios.get("/api/isadmin", {
            headers: { Authorization: "Bearer " + this.token },
          });
          this.isAdmin = response.data.message;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            this.$router.push("/login");
          }
        }
        if (this.isAdmin) {
          this.$router.push("/admin");
        }
  
        try {
          const pro_data = await axios.get("/api/ispro", {
            headers: { Authorization: "Bearer " + this.token },
          });
          this.isPro = pro_data.data.message;
        } catch (error) {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            this.$router.push("/login");
          }
        }
  
        if (this.isPro) {
          this.$router.push("/professional");
        }
      }
    },
    watch: {
      token(newToken) {
        if (!newToken) {
          // Clear user-specific data if token is removed
          this.isAdmin = false;
          this.isPro = false;
        }
      },
    },
  });
  
  export default pro_navbar;
  