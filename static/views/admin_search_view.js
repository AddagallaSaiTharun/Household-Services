import navbar from "../components/navbar.js";
import searchBar from "../components/search-bar.js";
import searchHero from "../components/search_hero.js";
import footerComp from "../components/footer.js";
import noti from "../components/notification.js";

const adminSearch = Vue.component("adminSearch", {
  template: `
  <div id="search_admin">
    <navbar />
    <searchHero />
    <searchBar @update-search="updateSearchQuery" :role="true" @update-option="updateOption" />
    <div class="container my-4" v-if="option === 'Service Requests'">
      <div class="row justify-content-center">
        <div class="col-md-3">
          <div class="filter-section">
            <h5 class="filter-title text-center">Filters</h5>
            <div class="mb-3">
              <label for="startDate" class="form-label">Completion Date (From):</label>
              <input type="date" id="startDate" class="form-control" v-model="filters.startDate" />
            </div>
            <div class="mb-3">
              <label for="endDate" class="form-label">Completion Date (To):</label>
              <input type="date" id="endDate" class="form-control" v-model="filters.endDate" />
            </div>
            <div class="mb-3">
              <label for="minCustRating" class="form-label">Minimum Customer Rating:</label>
              <input type="number" id="minCustRating" class="form-control" v-model.number="filters.minCustRating" min="1" max="5" />
            </div>
            <div class="mb-3">
              <label for="minProfRating" class="form-label">Minimum Professional Rating:</label>
              <input type="number" id="minProfRating" class="form-control" v-model.number="filters.minProfRating" min="1" max="5" />
            </div>
          </div>
        </div>
        <div class="col-md-9">
          <p v-if="isLoading">Loading service requests...</p>
          <div v-else>
            <div
              v-for="request in paginatedRequests"
              :key="request.srvcreq_id"
              class="card mb-3"
              style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden;"
            >
              <div class="row g-0">
                <!-- Image Section -->
                <div class="col-md-3 d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">
                  <img
                    :src="request.user_image_url || 'static/images/profile.jpeg'"
                    alt="User Image"
                    class="img-thumbnail rounded-circle"
                    style="width: 150px; height: 150px;"
                  />
                </div>
                <!-- Content Section -->
                <div class="col-md-9">
                  <div class="card-body">
                    <div class="row">
                      <!-- User Information -->
                      <div class="col-md-5">
                        <p class="text-primary mb-1">
                          <strong>User Name:</strong> {{ request.first_name }} {{ request.last_name }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>User Phone:</strong> {{ request.phone }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Service Cost:</strong> ₹{{ request.cost }}
                        </p>
                        <h6 class="text-secondary">Professional Rating: {{ request.prof_rating }} ⭐</h6>
                      </div>
                      <!-- Service Details -->
                      <div class="col-md-7">
                        <p class="text-primary mb-1">
                          <strong>Request Date:</strong> {{ request.date_srvcreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Completion Date:</strong> {{ request.date_cmpltreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Service Area:</strong> {{ request.address }}
                        </p>
                        <h6 class="text-secondary">Customer Rating: {{ request.cust_rating }} ⭐</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <nav class="d-flex justify-content-end">
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
                  <a class="page-link" href="#" @click.prevent="changePage(page)"
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
    <div class="container my-4" v-if="option === 'Users'">
      <div class="row justify-content-center">
        <div class="col-md-9">
          <p v-if="isLoading">Loading service requests...</p>
          <div v-else>
            <div
              v-for="request in paginatedRequests"
              :key="request.srvcreq_id"
              class="card mb-3"
              style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden;"
            >
              <div class="row g-0">
                <!-- Image Section -->
                <div class="col-md-3 d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">
                  <img
                    :src="request.user_image_url || 'static/images/profile.jpeg'"
                    alt="User Image"
                    class="img-thumbnail rounded-circle"
                    style="width: 150px; height: 150px;"
                  />
                </div>
                <!-- Content Section -->
                <div class="col-md-9">
                  <div class="card-body">
                    <div class="row">
                      <!-- User Information -->
                      <div class="col-md-5">
                        <p class="text-primary mb-1">
                          <strong>User Name:</strong> {{ request.first_name }} {{ request.last_name }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>User Phone:</strong> {{ request.phone }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Service Cost:</strong> ₹{{ request.cost }}
                        </p>
                        <h6 class="text-secondary">Professional Rating: {{ request.prof_rating }} ⭐</h6>
                      </div>
                      <!-- Service Details -->
                      <div class="col-md-7">
                        <p class="text-primary mb-1">
                          <strong>Request Date:</strong> {{ request.date_srvcreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Completion Date:</strong> {{ request.date_cmpltreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Service Area:</strong> {{ request.address }}
                        </p>
                        <h6 class="text-secondary">Customer Rating: {{ request.cust_rating }} ⭐</h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Pagination -->
            <nav class="d-flex justify-content-end">
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
                  <a class="page-link" href="#" @click.prevent="changePage(page)"
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
    <noti />
    <footerComp />
  </div>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      optionResult:{
          'Service Requests': [],
          'Users': [],
      },
      requests: [],
      searchQuery: "",
      currentPage: 1,
      requestsPerPage: 10,
      isLoading: true,
      option: 'Service Requests',  
      filters: {
        startDate: "",
        endDate: "",
        minCustRating: 0,
        minProfRating: 0,
      }
    };
  },
  computed: {
    filteredRequests() {
      const query = this.searchQuery.toLowerCase();
      return this.requests.filter((request) => {
        const matchesQuery =
          request.first_name?.toLowerCase().includes(query) ||
          request.last_name?.toLowerCase().includes(query) ||
          request.phone?.toString().includes(query) ||
          request.srvc_status?.toLowerCase().includes(query) ||
          request.srvcreq_id?.toString().includes(query) ||
          request.email?.toLowerCase().includes(query);

        const matchesDate =
          (!this.filters.startDate ||
            new Date(request.date_cmpltreq) >= new Date(this.filters.startDate)) &&
          (!this.filters.endDate ||
            new Date(request.date_cmpltreq) <= new Date(this.filters.endDate));

        const matchesCustRating =
          !this.filters.minCustRating ||
          request.cust_rating >= this.filters.minCustRating;

        const matchesProfRating =
          !this.filters.minProfRating ||
          request.prof_rating >= this.filters.minProfRating;

        return matchesQuery && matchesDate && matchesCustRating && matchesProfRating;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.requestsPerPage);
    },
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.requestsPerPage;
      const end = start + this.requestsPerPage;
      return this.filteredRequests.slice(start, end);
    },
  },
  methods: {
    async fetchServiceRequests() {
      try {
        this.isLoading = true;
        if (!this.token) {
          console.error("Token missing. Redirecting to login...");
          this.$router.push("/login");
        }
        const response = await axios.get("/api/srvcreq", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });
        this.requests = JSON.parse(response.data)['message'];
        this.optionResult.requestsService = this.requests;
        const userResponse = await axios.get("/api/users", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });
        this.optionResult.requestsUsers = JSON.parse(userResponse.data)['message'];
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        this.isLoading = false;
      }
    },
    updateSearchQuery(query) {
      this.searchQuery = query;
      this.currentPage = 1;
    },
    updateOption(option) {
      this.option = option;
      this.clearFilters();
      this.requests = optionResult[option];
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    applyFilters() {
      this.currentPage = 1;
    },
    clearFilters() {
      this.filters = {
        startDate: "",
        endDate: "",
        minCustRating: 0,
        minProfRating: 0,
      };
      this.currentPage = 1;
    },
  },
  async created() {
    await this.fetchServiceRequests();
  },
  components: { navbar, footerComp, searchHero, searchBar, noti },
});

export default adminSearch;
