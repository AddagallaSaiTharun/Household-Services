const navbar = Vue.component("navbar", {
  template: `
    <nav style="display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background-color: #fff; color: white;">
      <div class="left">
        <router-link class="navbar-brand" to="/" style="text-decoration: none;color:black">
          <h2 style="margin: 0; font-size: 24px;">Fix-Up-Crew</h2>
        </router-link>
      </div>

      <div class="right" style="display: flex; align-items: center; gap: 20px;">
        <!-- Login & Signup Links -->
        <div v-if="!isUserLoggedIn" style="display: flex; gap: 15px;">
          <router-link class="nav-link" to="/login" style="text-decoration: none; color: white; font-size: 16px; padding: 8px 12px; border-radius: 5px; transition: background-color 0.3s;" @mouseover="hoverLink($event)" @mouseleave="leaveLink($event)">
            Login
          </router-link>
          <router-link class="nav-link" to="/signup" style="text-decoration: none; color: white; font-size: 16px; padding: 8px 12px; border-radius: 5px; transition: background-color 0.3s;" @mouseover="hoverLink($event)" @mouseleave="leaveLink($event)">
            Signup
          </router-link>
        </div>

        <!-- User Actions (Cart, Profile) -->
        <div v-if="isUserLoggedIn" style="display: flex; align-items: center; gap: 15px;">
          <!-- Cart Icon -->
          <img src="/static/icons/trolley.png" alt="Cart" style="width: 24px; cursor: pointer; margin-right: 8px;"/>

          <!-- Profile Icon with Dropdown -->
          <div style="position: relative;">
            <img src="/static/icons/profile.png" alt="Profile" @click="toggleprofile" style="width: 24px; cursor: pointer;"/>
            
            <!-- Dropdown Menu -->
            <div id="dropdownMenu" style="display: none; position: absolute; top: 35px; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); padding: 10px; width: 150px; color: #333;">
              <a style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" href="#">{{ user }}</a>
              <a style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;" href="#">Settings</a>
              <a style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px; cursor: pointer;" @click="logout">Logout</a>
              
              <div v-if="!isAdmin">
                <a v-if="!isPro" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px; cursor: pointer;" @click="regpro">Register as a Pro</a>
                <a v-if="isPro" style="display: block; padding: 8px 10px; text-decoration: none; color: black; font-size: 14px;">You are a Pro</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      isAdmin: false,
      isPro: false,
    };
  },
  computed: {
    isUserLoggedIn() {
      return !!localStorage.getItem("user");
    },
    user() {
      return localStorage.getItem("user");
    },
  },
  methods: {
    regpro() {
      window.location.href = "/#/register_pro";
    },
    toggleprofile() {
      const dropdownMenu = document.getElementById("dropdownMenu");
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    },
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    },
    hoverLink(event) {
      event.target.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    },
    leaveLink(event) {
      event.target.style.backgroundColor = "transparent";
    },
  },
  async created() {
    if (!this.token) {
      window.location.href = "/#/login";
    }
    if (this.token) {
      try {
        const response = await axios.get("/api/isadmin", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });
        this.isAdmin = response.data.message;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/#/login";
        }
      }

      try {
        const pro_data = await axios.get("/api/ispro", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });
        this.isPro = pro_data.data.message;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/#/login";
        }
      }
    }
  },
});

export default navbar;
