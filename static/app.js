import Home from "./home.js";
import Login from "./login.js";
import Signup from "./signup.js";


const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
];


const router = new VueRouter({
  routes,
});

var app = new Vue({
  el: "#app",
  router: router,
});
