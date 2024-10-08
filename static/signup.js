const Signup = Vue.component("SignupComponent", {
  template: `
    <div>
      <h2>Sign Up</h2>
  
      <form @submit.prevent="submitSignup">
          <label for="email">Email:</label>
          <input type="email" v-model="email" name="email" id="email" required>
          <br>
  
          <label for="first_name">First Name:</label>
          <input type="text" v-model="first_name" name="first_name" id="first_name" required>
          <br>
  
          <label for="last_name">Last Name (optional):</label>
          <input type="text" v-model="last_name" name="last_name" id="last_name">
          <br>
  
          <label for="age">Age (optional):</label>
          <input type="number" v-model="age" name="age" id="age">
          <br>
  
          <label for="gender">Gender (optional):</label>
          <input type="text" v-model="gender" name="gender" id="gender">
          <br>
  
          <label for="user_image_url">Image URL (optional):</label>
          <input type="url" v-model="user_image_url" name="user_image_url" id="user_image_url">
          <br>
  
          <label for="password">Password:</label>
          <input type="password" v-model="password" name="password" id="password" required>
          <br>
  
          <label for="confirm_password">Confirm Password:</label>
          <input type="password" v-model="confirm_password" name="confirm_password" id="confirm_password" required>
          <br>
  
          <label for="phone">Phone:</label>
          <input type="tel" v-model="phone" name="phone" id="phone" pattern="[0-9]{10}" required>
          <br>
  
          <label for="address">Address:</label>
          <textarea v-model="address" name="address" id="address"></textarea>
          <br>
  
          <label for="address_link">Address Link:</label>
          <input type="url" v-model="address_link" name="address_link" id="address_link">
          <br>
  
          <label for="pincode">Pincode:</label>
          <input type="number" v-model="pincode" name="pincode" id="pincode">
          <br>
  
          <input type="submit" value="Sign Up">
      </form>
      <br />
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
      <a href="/login">Already have an account? Login here</a>
    </div>
  `,
  data: function () {
    return {
      email: '',
      first_name: '',
      last_name: '',
      age: '',
      gender: '',
      user_image_url: '',
      password: '',
      confirm_password: '',
      phone: '',
      address: '',
      address_link: '',
      pincode: ''
    };
  },
  methods: {
    submitSignup() {
      // Prepare the form data to be sent via POST request
      const formData = new URLSearchParams();
      formData.append('email', this.email);
      formData.append('first_name', this.first_name);
      formData.append('last_name', this.last_name);
      formData.append('age', this.age);
      formData.append('gender', this.gender);
      formData.append('user_image_url', this.user_image_url);
      formData.append('password', this.password);
      formData.append('confirm_password', this.confirm_password);
      formData.append('phone', this.phone);
      formData.append('address', this.address);
      formData.append('address_link', this.address_link);
      formData.append('pincode', this.pincode);

      // Send the POST request
      fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'signup successful') {
          alert('Signup successful!');
          window.location.href = '/login';
        } else {
          alert('Signup failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  }
});


export default Signup;