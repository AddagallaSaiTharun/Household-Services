const Home = Vue.component("home-component", {
  template: `
    <div>
      <h2>Welcome, {{ username }}!</h2>
      <p>You are successfully logged in.</p>
      <ul>
        <li><a @click="logout" href="#">Logout</a></li>
        <li><a href="/signup">Sign up another user</a></li>
      </ul>
      <div id="response"></div>
    </div>
  `,
  data() {
    return {
      username: localStorage.getItem("user"),  // Get username from localStorage
      token: localStorage.getItem("token"),    // Get token from localStorage
    };
  },
  created() {
    // Use 'this.token' from the data object
    if (!this.token) {
      window.location.href = "/#/login";  // Redirect to login if no token found
    } else {
      // Fetch from the protected route with the token
      fetch(`/protected?token=${this.token}`, {
        method: "GET",  // Use GET because the backend expects it
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // Display the response message
          document.getElementById("response").innerHTML = `<p>${
            data.message || data.Alert
          }</p>`;
        })
        .catch((error) => {
          console.error("Error:", error);
          document.getElementById("response").innerHTML = `<p>An error occurred</p>`;
        });
    }
  },
  methods: {
    logout() {
      // Remove token and user from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Send a GET request to /logout to log out from the server side
      fetch("/logout", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Logged out") {
            alert("You have been logged out.");
            window.location.href = "/#/login";  // Redirect to login
          }
        })
        .catch((error) => {
          console.error("Error during logout:", error);
        });
    },
  },
});

export default Home;
