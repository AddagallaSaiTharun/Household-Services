import Home from "./home.js";
import Login from "./login.js";
import Signup from "./signup.js";
import navbar from "./navbar.js";
import admin_home from "./admin_home.js";
import add_service from "./add_service.js";
import service from "./service.js";
import register_pro from "./register_pro.js";


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
