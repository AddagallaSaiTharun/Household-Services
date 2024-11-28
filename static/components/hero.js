const heroCarousel = Vue.component("heroCarousel", {
  props: [],
  template: `
    <div id="heroCarousel" class="carousel slide shadow" data-bs-ride="carousel">
        <div class="carousel-indicators" style="z-index: 10;">
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active" aria-current="true"
                aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
            <div class="carousel-item carousel-item-hero active" style="background-image: url('static/images/home/hero1.jpg')">
                <div class="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
                    <h1><b>Every Home Solution, Just a Tap Away!</b></h1>
                    <p class="lead">
                        Expert repair and maintenance services at your doorstep.
                    </p>
                    <button class="btn p-3" style="background-color: rgb(99, 106, 232); color: #fff;">Get
                        Started</button>
                </div>
            </div>
            <div class="carousel-item carousel-item-hero" style="background-image: url('static/images/home/hero2.jpg')">
                <div class="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
                    <h1><b>Your Home,Our Mission</b></h1>
                    <p class="lead">
                        From Fixes to Finishes – We’ve Got Your Home Covered!
                    </p>
                    <button class="btn p-3" style="background-color: rgb(99, 106, 232); color: #fff;">Explore
                        Services</button>
                </div>
            </div>
            <div class="carousel-item carousel-item-hero" style="background-image: url('static/images/home/hero3.jpg')">
                <div class="carousel-caption d-flex flex-column justify-content-center align-items-center h-100">
                    <h1><b>Expert Repair & Maintenance</b></h1>
                    <p class="lead">
                        Professional services to keep your home in top shape.
                    </p>
                    <button class="btn p-3" style="background-color: rgb(99, 106, 232); color: #fff;">Book Now</button>
                </div>
            </div>
        </div>
    </div>

      `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
    };
  },
  created() {},

  methods: {},
});

export default heroCarousel;
