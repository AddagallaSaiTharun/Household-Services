// Navbar Component
const navbar = Vue.component("navbar", {
  template: `
<nav style="display: flex; justify-content: space-between">
        <div class="left">
          <router-link class="navbar-brand" to="/">MyApp</router-link>
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
              <a class="nav-link" href="#">Welcome, {{ user }}!</a>
            </div>
            <div v-if="isUserLoggedIn" class="nav-item">
              <a class="nav-link" href="#" @click="logout">Logout</a>
            </div>
          </div>
        </div>
      </nav>
  
    `,
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
    // Handle logout by removing user from localStorage
    logout() {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    },
  },
});

export default navbar;
