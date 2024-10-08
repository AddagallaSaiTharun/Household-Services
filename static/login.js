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
    login() {
      var email = document.getElementById("email").value;
      var password = document.getElementById("password").value;
      console.log(email, password);
      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.token) {
            console.log(data);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", data.name);
            alert("Login successful!");
            window.location.href = "/";
          } else {
            alert("Login failed: " + data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
});

export default Login;
