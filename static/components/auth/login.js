import navbar from "../navbar.js";
import footerman from "../footer.js";

const Login = Vue.component("LoginComponent", {
  template: `
  <div id="login">
    <navbar />
    <div
      style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; font-family: Arial, sans-serif;">
      <div
          style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); width: 300px;">
          <h2 style="text-align: center; color: #333;">Login</h2>
          <div v-if="!token">
              <form @submit.prevent="login" style="display: flex; flex-direction: column; gap: 15px;">
                  <label for="email" style="color: #333; font-size: 14px;">Email:</label>
                  <input type="email" name="email" id="email" required
                      style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                  <label for="password" style="color: #333; font-size: 14px;">Password:</label>
                  <input type="password" name="password" id="password" required
                      style="padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;">
                  <input type="submit" value="Login"
                      style="padding: 10px; border: none; border-radius: 5px; background-color: #4CAF50; color: white; font-size: 16px; cursor: pointer;">
              </form>
              <p style="text-align: center; margin: 20px 0;">
                  <a href="google/" style="text-decoration: none;">
                      <img id="google"
                          src="https://img.shields.io/badge/Google-Connect-brightgreen?style=for-the-badge&labelColor=black&logo=google"
                          alt="Google" />
                  </a>
              </p>
          </div>
          <div v-if="token" style="text-align: center; color: #333;">
              <h2>You are already logged in, {{ user }}!</h2>
          </div>
          <div style="text-align: center; margin-top: 20px;">
              <RouterLink to="/signup" style="color: #4CAF50; font-size: 14px; text-decoration: none;">Don't have an account?
                  Sign up here</RouterLink>
          </div>
      </div>
    </div>
    <footerman />
    </div>
  `,
  data: function () {
    return {
      email: "",
      password: "",
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
    };
  },
  methods: {
    async login() {
      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;
      try {
        const response = await axios.post("/api/login", {
          email: email,
          password: password,
        });

        if (response.status === 200) {
          const data = JSON.parse(response.data);
          localStorage.setItem("token", data.token);
          localStorage.setItem("email", data.email);
          localStorage.setItem("user", data.name);
          if (data.role === "user")
            this.$router.push("/");
          else if (data.role === "admin")
            this.$router.push("/admin");
          else if (data.role === "professional")
            this.$router.push("/professional");
        }
      }
      catch (error) {
        let message = JSON.parse(error["response"].data)["error"];
        alert(message);
      }
    },
  },
  components: {
    navbar,
    footerman,
  },
});

export default Login;
