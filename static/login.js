const Login = Vue.component("LoginComponent", {
  template: `
    <div>
      <h2>Login</h2>
      <div v-if="!token">
      <form @submit.prevent="login">
        <label for="email">Email:</label>
        <input type="email" name="email" id="email" required />
        <br />
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required />
        <br />
        <input type="submit" value="Login" />
      </form>
      <p align="center">
        <a href="google/">
          <img
            id="google"
            src="https://img.shields.io/badge/Google-Connect-brightgreen?style=for-the-badge&labelColor=black&logo=google"
            alt="Google"
          />
          <br />
        </a>
      </p>
      </div>
      <div v-if="token">
      <h2>You are already logged in , {{ user }}!</h2>
      </div>
      
      <a href="/#/signup">Don't have an account? Sign up here</a>
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

        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", data.name);
          window.location.href = "/";
        } else {
          alert("Login failed: " + data.message);
        }
      } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again.");
      }
    },
  },
});

export default Login;
