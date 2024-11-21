import Home from "./components/users/home.js";
import Login from "./components/auth/login.js";
import Signup from "./components/auth/signup.js";
import navbar from "./components/navbar.js";
import admin_home from "./components/admin/admin_home.js";
import add_service from "./components/admin/add_service.js";
import service from "./components/users/service.js";
import register_pro from "./components/users/register_pro.js";
import service_grp from "./components/users/service_grp.js";
import prohome from "./components/professional/pro_home.js";
import noti from "./components/notification.js";
import user_stats from "./components/professional/user_stats.js";
import current_order from "./components/professional/current_order.js";
import serv_req_form from "./components/users/serv_req_form.js";
import request_cards from "./components/professional/request_cards.js";
import otp_form from "./components/professional/otp_form.js";
import rating_form from "./components/professional/rating_form.js";
import customers_view from "./views/customers_view.js";
import search_view from "./views/search_view.js";
import summary_view from "./views/summary_view.js"
import footerman from "./components/footer.js";
import Pro_view from "./views/professional_view.js";
import Admin_view from "./views/Admin_view.js";



const routes = [
  // { path: "/", component: customers_view },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/add_service", component: add_service },
  { path: "/service/:id", component: service },
  { path: "/register_pro", component: register_pro },


  { path: "/", component: customers_view },
  { path: "/search", component: search_view },
  { path: "/summary", component: summary_view },
  { path: "/professional", component: Pro_view },
  { path: "/admin", component: Admin_view}
];

const router = new VueRouter({
  routes,
});

var app = new Vue({
  el: "#app",
  router: router,
});
