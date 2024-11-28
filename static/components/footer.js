const footerman = Vue.component("foo", {
  props: [],
  template: `
          <footer class="footer text-center">
        <div class="container">
            <div class="fs-1 fw-bold" style="justify-content:flex-start ;">
                <img src="static/images/home/Image.jpg" alt="Logo" />
                Fix-Up-Crew
            </div>
            <p>Subscribe to our newsletter</p>
            <form class="form-inline justify-content-center">
                <input type="email" class="form-control subscribe-input" placeholder="Input your email">
                <button type="submit" class="btn btn-custom-outline p-2" style="height: 40px;">Subscribe</button>
            </form>
            <div class="row mt-4">
                <div class="col-md-3">
                    <h6>Product</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Pricing</a></li>
                    </ul>
                </div>
                <div class="col-md-3">
                    <h6>Resources</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">User guides</a></li>
                        <li><a href="#">Webinars</a></li>
                    </ul>
                </div>
                <div class="col-md-3">
                    <h6>Company</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">About us</a></li>
                        <li><a href="#">Contact us</a></li>
                    </ul>
                </div>
                <div class="col-md-3">
                    <h6>Plans & Pricing</h6>
                    <ul class="list-unstyled">
                        <li><a href="#">Personal</a></li>
                        <li><a href="#">Start up</a></li>
                        <li><a href="#">Organization</a></li>
                    </ul>
                </div>
            </div>
            <p class="mt-4">© 2024 Brand, Inc. • <a href="#">Privacy</a> • <a href="#">Terms</a> • <a
                    href="#">Sitemap</a></p>
            <div class="social-icons">
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-linkedin"></i></a>
                <a href="#"><i class="fab fa-youtube"></i></a>
            </div>
        </div>
    </footer>
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

export default footerman;
