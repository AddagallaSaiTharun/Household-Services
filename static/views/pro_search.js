import pro_navbar from "../components/pro_navbar.js";
import search_bar from "../components/search-bar.js";
import search_hero from "../components/search_hero.js";
import footer_comp from "../components/footer.js";
import noti from "../components/notification.js";
const pro_search = Vue.component("pro_search", {
  name: "pro_search",
  template: `
    <div>
      <div id="search">
        <pro_navbar></pro_navbar>
        <search_hero></search_hero>
        <search-bar @update-search="updateSearchQuery"></search-bar>
        <div class="container my-4" >
            <div class="row" style="display: flex; justify-content: center;">
              <div class="col-md-9">
                <p v-if="loading">Loading services...</p>
                <!-- Result Cards -->
                <div
                  v-if="!loading"
                  v-for="service in paginatedServices"
                  :key="service.service_id"
                  class="result-card d-flex mb-3"
                >
                  <img
                    :src="service.image || 'static/images/profile.jpeg'"
                    alt="Service Image"
                    class="img-thumbnail"
                    style="width: 150px; height: 150px; border-radius:50%;margin : 10px"
                  />
                  <div>
                    <div class="result-content ms-3">

                      <p class="text-primary mb-1">
                        <strong>User Name : </strong> {{ service.first_name }} {{ service.last_name }}
                      </p>
                      <p class="text-primary mb-1">
                        <strong>User Phone : </strong> {{ service.phone }}
                      </p>
                      <p class="text-primary mb-1">
                        <strong>Closed service at : </strong>  \₹{{ service.service_price }}
                      </p>
                      <h6>Professional rating : {{ service.prof_rating }} ⭐</h6>
                      <h6>Customer rating : {{ service.cust_rating }} ⭐</h6>
                      
                    </div>              
                  </div>
                  <div>
                    <div class="result-content ms-3">
                      <p class="text-primary mb-1">
                        <strong>Request Date : </strong>{{ service.date_srvcreq }}
                      </p>
                      <p class="text-primary mb-1">
                        <strong>completion Date : </strong>{{ service.date_cmpltreq }}
                      </p>
                      <p>Service area : {{ service.address }}</p>
                      
                      
                    </div>              
                  </div>
                  
                </div>

                <!-- Pagination -->
                <nav class="d-flex justify-content-end" v-if="!loading">
                  <ul class="pagination mt-3">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(currentPage - 1)"
                        >Previous</a
                      >
                    </li>
                    <li
                      class="page-item"
                      v-for="page in totalPages"
                      :key="page"
                      :class="{ active: page === currentPage }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(page)"
                        >{{ page }}</a
                      >
                    </li>
                    <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <a
                        class="page-link"
                        href="#"
                        @click.prevent="changePage(currentPage + 1)"
                        >Next</a
                      >
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
      </div>
      <noti></noti>
    </div>
    `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      services: [],
      searchQuery: "",
      selectedCategories: [],
      priceRange: 240,
      currentPage: 1,
      servicesPerPage: 10,
      loading: true, // Indicates whether data is being fetched
    };
  },
  computed: {
    filteredServices() {
      return this.services.filter((service) => {
        const matchesQuery =
          this.searchQuery === "" ||
          service.first_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          service.last_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          service.phone.toString().includes(this.searchQuery) ||
          service.srvc_status.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          service.srvc_id.toString().includes(this.searchQuery) ||
          service.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesQuery;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredServices.length / this.servicesPerPage);
    },
    paginatedServices() {
      const start = (this.currentPage - 1) * this.servicesPerPage;
      const end = start + this.servicesPerPage;
      return this.filteredServices.slice(start, end);
    },
  },
  methods: {
    redirect(id) {
      window.location.href = "/#/service/" + id;
    },
    async fetchServicerequests() {
      try {
        this.loading = true; // Start loading
        const response = await axios.get("/api/srvcreq", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });

        this.services = JSON.parse(response.data)["message"];

        // Fetch details for each service
        for (const [index, service] of this.services.entries()) {
          const userResponse = await axios.get("/api/user", {
            params: {
              user_id: service.customer_id,
            },
            headers: {
              Authorization: "Bearer " + this.token,
            },
          });
          const ratesResponse = await axios.get("/api/service", {
            params: {
              service_id: service.service_id,
            },
            headers: {
              Authorization: "Bearer " + this.token,
            },
          });
          this.$set(this.services, index, {
            ...service,
            service_price: JSON.parse(ratesResponse.data).content[0].service_base_price,
            image: JSON.parse(userResponse.data).message.user_image_url,
          });
          console.log(service)
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        this.loading = false; // Stop loading
      }
    },
    updateSearchQuery(query) {
      this.searchQuery = query;
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  async created() {
    await this.fetchServicerequests();
  },
  components: { pro_navbar, footer_comp, search_hero, search_bar, noti },
});

export default pro_search;
