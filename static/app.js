import Home from "./components/home.js";
import Login from "./components/login.js";
import Signup from "./components/signup.js";
import navbar from "./components/navbar.js";
import admin_home from "./components/admin_home.js";
import add_service from "./components/add_service.js";
import service from "./components/service.js";
import register_pro from "./components/register_pro.js";
import service_grp from "./components/service_grp.js";
import prohome from "./components/pro_home.js";
import noti from "./components/notification.js";
import user_stats from "./components/user_stats.js";
import current_order from "./components/current_order.js";
import serv_req_form from "./components/serv_req_form.js";





const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/add_service", component: add_service },
  { path: "/service/:id", component: service },
  { path: "/register_pro", component: register_pro },
];

const router = new VueRouter({
  routes,
});

var app = new Vue({
  el: "#app",
  router: router,
});
