import Login from "./components/auth/login.js";
import Signup from "./components/auth/signup.js";
import add_service from "./components/admin/add_service.js";
import service from "./components/users/service.js";
import register_pro from "./components/users/register_pro.js";
import customers_view from "./views/customers_view.js";
import search_view from "./views/search_view.js";
import summary_view from "./views/summary_view.js"
import Pro_view from "./views/professional_view.js";
import Admin_view from "./views/admin_view.js";
import order_view from "./views/orders_view.js";
import pro_search from "./views/pro_search.js";
import adminSearch from "./views/admin_search_view.js";

const routes = [
  { path: "/", component: customers_view },
  { path: "/search", component: search_view },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/add_service", component: add_service },
  { path: "/service/:id", component: service },
  { path: "/register_pro", component: register_pro },
  { path: "/summary", component: summary_view },
  { path: "/admin", component: Admin_view},
  { path: "/professional", component: Pro_view },
  { path:"/searchorders", component: pro_search },
  { path: "/cart", component: order_view},
  { path: "/adminsearch", component: adminSearch},

];

const router = new VueRouter({
  routes,
});

var app = new Vue({
  el: "#app",
  router: router,
});
