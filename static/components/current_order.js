const current_order = Vue.component("current_order", {
    template:`
    <div
      style="
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.356);
        height: 2.5in;
        padding: 20px;

      "
    >
      <div style="font-size: 30px; margin: 0 0 0 30px">Current Order</div>
      <div style="display: flex">
        <div style="width: 75%">
          <div class="container">
            <p><strong>Name:</strong> Williams</p>
            <p><strong>Location:</strong> Abids</p>
            <p><strong>Contact:</strong> 1287234098</p>
            <p><strong>Price:</strong> $78</p>
          </div>
        </div>
        <div style="width: 25%">
          <center>
            <p style="font-size: 25px">Hurry Up!</p>
            <div class="clock-container" >
              <img
                
                src="/static/icons/clock icon.png"
                alt="clock"
                width="50"
                height="50"
              />
            </div>
          </center>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            token: localStorage.getItem("token"),
            user: localStorage.getItem("user"),
        }
    },
});

export default current_order;