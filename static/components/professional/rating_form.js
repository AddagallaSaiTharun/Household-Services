const rating_form = Vue.component("rating_form", {
  name: "rating_form",
  props: ["srvc_req_id", "showratingForm"],
  template: `
        <div>
        <div style="background-color: white; padding: 20px; border-radius: 10px; width: 3in; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);">
    <h2 style="margin-bottom: 15px; font-size: 24px; color: #333;">Submit Your Review for the service </h2>
    <form @submit.prevent="submitForm">
            
      <!-- Star Rating (Graphical 5 Stars) -->
      <div style="margin-bottom: 15px;">
        <label style="font-weight: bold;" for="star_rating">Rating:</label>
        <div style="display: flex; align-items: center;">
          <span v-for="n in 5" :key="n" @click="star_rating = n" style="cursor: pointer; font-size: 20px; color: #FFD700;">
            <span v-if="n <= star_rating">&#9733;</span> <!-- Filled star -->
            <span v-else>&#9734;</span> <!-- Empty star -->
          </span>
        </div>
      </div>
  
      <!-- Review Text Area -->
      <div style="margin-bottom: 15px;">
        <label style="font-weight: bold;" for="review_text">Review:</label>
        <textarea v-model="review_text" rows="3" placeholder="Write your review here" required style="width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
      </div>
      
      <!-- Submit and Cancel Buttons -->
      <button type="submit" style="width: 100%; padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Submit Review</button>
      
      <!-- Success/Error Message -->
      <div v-if="message" :style="{color: error ? 'red' : 'green', fontSize: '14px', marginTop: '10px'}">{{ message }}</div>
    </form>
  </div>

        </div>    
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      star_rating: 0,
      review_text: "",
      message: "",
      error: false,
    };
  },
  methods: {
    async submitForm() {
      const sub = await axios.put("api/srvcreq",{
        rating: this.star_rating,
        review: this.review_text,
        srvcreq_id: this.srvc_req_id
      },{
        headers: {
          Authorization: "Bearer " + this.token,
        },
      })
      if(sub.status === 200){
        alert("submited review!!");
        window.location.reload();
      }
    },
    
  },
});

export default rating_form;