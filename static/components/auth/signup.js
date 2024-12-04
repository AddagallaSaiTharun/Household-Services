const Signup = Vue.component("SignupComponent", {
  template: `
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f0f2f5;
        font-family: Arial, sans-serif;
      "
    >
      <div
        style="
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 6in;
        "
      >
        <h2 style="text-align: center; color: #333">Sign Up</h2>

        <form
          @submit.prevent="submitSignup"
          style="display: flex; flex-direction: column; gap: 15px"
        >
          <div style="display: flex; gap: 10px">
            <div style="flex: 1">
              <label for="first_name" style="color: #333; font-size: 14px"
                >First Name:</label
              >
              <input
                type="text"
                v-model="profile.first_name"
                name="first_name"
                id="first_name"
                required
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="last_name" style="color: #333; font-size: 14px"
                >Last Name:</label
              >
              <input
                type="text"
                v-model="profile.last_name"
                name="last_name"
                id="last_name"
                required
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="email" style="color: #333; font-size: 14px">Email:</label>
              <input
                type="email"
                v-model="profile.email"
                name="email"
                id="email"
                required
                style="
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  width: 100%;
                "
              />
            </div>
          </div>

          <div style="display: flex; gap: 10px">
            <div style="flex: 1">
              <label for="phone" style="color: #333; font-size: 14px">Phone:</label>
              <input
                type="tel"
                v-model="profile.phone"
                name="phone"
                id="phone"
                pattern="[0-9]{10}"
                required
                style="
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  width: 100%;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="address_link" style="color: #333; font-size: 14px"
                >Address Link (optional):</label
              >
              <input
                type="url"
                v-model="profile.address_link"
                name="address_link"
                id="address_link"
                style="
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  width: 100%;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="user_image_url" style="color: #333; font-size: 14px"
                >Image URL (optional):</label
              >
              <input
                type="url"
                v-model="profile.user_image_url"
                name="user_image_url"
                id="user_image_url"
                style="
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  width: 100%;
                "
              />
            </div>
          </div>

          <label for="address" style="color: #333; font-size: 14px">Address:</label>
          <textarea
            v-model="profile.address"
            name="address"
            id="address"
            style="padding: 8px; border: 1px solid #ddd; border-radius: 5px"
          ></textarea>

          <div style="display: flex; gap: 10px">
            <div style="flex: 1">
              <label for="pincode" style="color: #333; font-size: 14px"
                >Pincode:</label
              >
              <input
                type="number"
                v-model="profile.pincode"
                name="pincode"
                id="pincode"
                required
                style="
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  width: 100%;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="age" style="color: #333; font-size: 14px">Age:</label>
              <input
                type="number"
                v-model="profile.age"
                name="age"
                id="age"
                required
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                "
              />
            </div>
            <div style="flex: 1">
              <label for="gender" style="color: #333; font-size: 14px"
                >Gender:</label
              >
              <select
                v-model="profile.gender"
                name="gender"
                id="gender"
                style="
                  width: 100%;
                  padding: 8px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                "
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <label for="password" style="color: #333; font-size: 14px"
            >Password:</label
          >
          <input
            type="password"
            v-model="profile.password"
            name="password"
            id="password"
            required
            style="padding: 8px; border: 1px solid #ddd; border-radius: 5px"
          />

          <label for="confirm_password" style="color: #333; font-size: 14px"
            >Confirm Password:</label
          >
          <input
            type="password"
            v-model="profile.confirm_password"
            name="confirm_password"
            id="confirm_password"
            required
            style="padding: 8px; border: 1px solid #ddd; border-radius: 5px"
          />

          <input
            type="submit"
            value="Sign Up"
            style="
              padding: 10px;
              border: none;
              border-radius: 5px;
              background-color: #4caf50;
              color: white;
              font-size: 16px;
              cursor: pointer;
            "
          />
        </form>

        <p style="text-align: center; margin: 20px 0">
          <a href="google/" style="text-decoration: none">
            <img
              id="google"
              src="https://img.shields.io/badge/Google-Connect-brightgreen?style=for-the-badge&labelColor=black&logo=google"
              alt="Google"
            />
          </a>
        </p>

        <div style="text-align: center">
          <RouterLink
            to="/login"
            style="color: #4caf50; font-size: 14px; text-decoration: none"
            >Already have an account? Login here</RouterLink
          >
        </div>
      </div>
    </div>
`,
  data() {
    return {
      profile: {
        email: "",
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        user_image_url: "",
        password: "",
        confirm_password: "",
        phone: "",
        address: "",
        address_link: "",
        pincode: "",
        role: "user",
      },
    };
  },
  methods: {
    async submitSignup() {
      try {
        const response = await axios.post("/api/user", this.profile,
        );
        if (response.status == 201) {
          this.$router.push("/login");
        } else {
          alert("Signup failed: " + response.data.message);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred during signup. Please try again.");
      }
    },
  },
});

export default Signup;
