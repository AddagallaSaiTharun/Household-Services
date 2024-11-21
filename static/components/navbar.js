const navbar = Vue.component("navbar", {
  template: `


  <div class="navbar">
        <div class="logo">
            <img src="static/images/home/Image.jpg" alt="Logo" />
            Fix-Up-Crew
        </div>
        <ul class="nav-links ps-4">
            <li><RouterLink to="/" :class="{active: $route.path === '/'}">Home</RouterLink></li>
            <li><RouterLink to="/search" :class="{active: $route.path === '/search'}">Search</RouterLink></li>
            <li v-if="token"><RouterLink to="/summary" :class="{active: $route.path === '/summary'}">Summary</RouterLink></li>
        </ul>
        <div v-if="!isAdmin & !isPro">
          <img src="/static/icons/trolley.png" alt="Cart" style="width: 24px; cursor: pointer; margin-right: 8px;"/>
        </div>
        
        <div style="position: relative;">
            <img class="ps-1" src="/static/icons/profile.png" alt="Profile" @click="toggleprofile" style="width: 24px; cursor: pointer;"/>
            
            <!-- Dropdown Menu -->
            <div class="ps-1" id="dropdownMenu" style="display: none; z-index:2; position: absolute; top: 35px; right: 0; background-color: white; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); padding: 10px; width: 150px; color: #333;">
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
      if (this.isAdmin) {
        window.location.href = "/#/admin";
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

      if(this.isPro){
        window.location.href = "/#/professional";
      }
    }
  },
});

export default navbar;
