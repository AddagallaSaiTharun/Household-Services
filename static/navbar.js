// Navbar Component
const navbar = Vue.component("navbar", {
  template: `
<nav style="display: flex; justify-content: space-between">
        <div class="left">
          <router-link class="navbar-brand" to="/">FixUpCrew</router-link>
        </div>
        <div class="right">
          <div style="display: flex">
            <div v-if="!isUserLoggedIn" class="nav-item">
              <router-link class="nav-link" to="/login">Login</router-link>
            </div>
            <div v-if="!isUserLoggedIn" class="nav-item">
              <router-link class="nav-link" to="/signup">Signup</router-link>
            </div>
          </div>
          <div style="display: flex">
            <div v-if="isUserLoggedIn" class="nav-item">
            
              <img style="width: 0.3in;margin:0 0.2in 0 0;" src="/static/icons/trolley.png" alt="">
            </div>
            <div v-if="isUserLoggedIn" class="nav-item">
              
              <div class="navbar-items">
              <img style="width: 0.3in;margin:0 0.2in 0 0;" src="/static/icons/profile.png" class="navbar-img" @click="toggleprofile" alt="">
              </div>
            </div>
            <div class="dropdown-content" id="dropdownMenu">
              <a style="text-decoration: none; color: black;" href="#">{{ user }}</a>
              <a style="text-decoration: none; color: black;" href="#">Settings</a>
              <a style="text-decoration: none; color: black;" class="nav-link" href="#" @click="logout">Logout</a>
              <a v-if="!isAdmin" style="text-decoration: none; color: black;" class="nav-link" @click="regpro">Register as a Pro</a>
            </div>
          </div>
        </div>
      </nav>
  
    `,
    data() {
      return {
        token: localStorage.getItem("token"),
        isAdmin: false,
      }
    },
  computed: {
    // Check if user is logged in
    isUserLoggedIn() {
      return !!localStorage.getItem("user");
    },
    // Get the user name from localStorage
    user() {
      return localStorage.getItem("user");
    },
  },
  methods: {
    regpro() {
      window.location.href = "/#/register_pro";
    },
    // Handle logout by removing user from localStorage
    toggleprofile() {
      const dropdownMenu = document.getElementById("dropdownMenu");
      if (
        dropdownMenu.style.display === "none" ||
        !dropdownMenu.style.display
      ) {
        dropdownMenu.style.display = "block";
      } else {
        dropdownMenu.style.display = "none";
      }
    },



    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    },
  },
  async created() {
    if (!this.token) {
      window.location.href = "/#/login";
    }
    const response = await axios.get("/api/isadmin", {
      headers: {
        Authorization: "Bearer " + this.token,
      },
    });
    this.isAdmin = response.data;
  },
});

export default navbar;
