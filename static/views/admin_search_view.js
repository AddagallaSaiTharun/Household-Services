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
            <p class="filter-label">Status:</p>
            <div class="mb-3">
            <div class="form-check">
              <label class="form-check-label" for="pending-checkbox">Pending</label>
              <input 
                class="form-check-input" 
                type="checkbox" 
                value="pending" 
                id="pending-checkbox" 
                v-model="filters['Service Requests'].selectedStatus"
                @change="applyFilters"
              >
              </div>
              <div class="form-check">
                <label class="form-check-label" for="rejected-checkbox">Rejected</label>
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  value="rejected" 
                  id="rejected-checkbox" 
                  v-model="filters['Service Requests'].selectedStatus"
                  @change="applyFilters"
                >
              </div>
              <div class="form-check">
                <label class="form-check-label" for="accepted-checkbox">Accepted</label>
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  value="accepted" 
                  id="accepted-checkbox" 
                  v-model="filters['Service Requests'].selectedStatus"
                  @change="applyFilters"
                >
              </div>
              <div class="form-check">
                <label class="form-check-label" for="completed-checkbox">Completed</label>
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  value="completed" 
                  id="completed-checkbox" 
                  v-model="filters['Service Requests'].selectedStatus"
                  @change="applyFilters"
                >
              </div>
          </div>
            <div class="mb-3">
              <p for="startDate" class="filter-label">Completion Date (From):</p>
              <input type="date" id="startDate" class="form-control" v-model="filters['Service Requests'].startDate" />
            </div>
            <div class="mb-3">
              <p for="endDate" class="filter-label">Completion Date (To):</p>
              <input type="date" id="endDate" class="form-control" v-model="filters['Service Requests'].endDate" />
            </div>
            <div class="mb-4">
                <p class="filter-label">Minimum Customer Rating:</p>
                <input
                  type="range"
                  class="price-slider"
                  v-model="filters['Service Requests'].minCustRating"
                  min="0"
                  max="5"
                  step="0.5"
                  @change="applyFilters"
                />
                <p>Minimum Customer Rating: {{ filters['Service Requests'].minCustRating }} ⭐</p>
              </div>
            <div class="mb-4">
                <p class="filter-label">Minimum Professional Rating:</p>
                <input
                  type="range"
                  class="price-slider"
                  v-model="filters['Service Requests'].minProfRating"
                  min="0"
                  max="5"
                  step="0.5"
                  @change="applyFilters"
                />
                <p>Minimum Professional Rating: {{ filters['Service Requests'].minProfRating }} ⭐</p>
              </div>
          </div>
        </div>
        <div class="col-md-9">
          <p v-if="isLoading">Loading service requests...</p>
          <div v-else>
          <p>{{ filteredRequests.length }} results found</p>
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
                          <strong>Service Area:</strong> {{ request.address}}
                        </p>
                        <h6 class="text-secondary">Professional Rating: {{ request.prof_rating || 0 }} ⭐</h6>
                        <h6 class="text-secondary">Customer Rating: {{ request.cust_rating || 0 }} ⭐</h6>
                      </div>
                      <!-- Service Details -->
                      <div class="col-md-7">
                      <p class="text-primary mb-1">
                        <strong>Service Name:</strong> {{ request.service_name }}
                      </p>
                        <p class="text-primary mb-1">
                          <strong>Request Date:</strong> {{ request.date_srvcreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Completion Date:</strong> {{ request.date_cmpltreq }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Service Cost:</strong> ₹{{ request.cost }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Status:</strong> {{ request.srvc_status }}
                        </p>
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
        <div class="col-md-3">
        <div class="filter-section">
          <h5 class="filter-title text-center">Filters</h5>
          <p class="filter-label">Role:</p>
          <div class="mb-3">
            <div class="form-check">
            <label class="form-check-label" for="user-checkbox">User</label>
              <input 
                class="form-check-input" 
                type="checkbox" 
                value="user" 
                id="user-checkbox" 
                v-model="filters['Users'].selectedRoles"
                @change="applyFilters"
              >

              </div>
              <div class="form-check">
              <label class="form-check-label" for="professional-checkbox">Professional</label>
              <input 
                class="form-check-input" 
                type="checkbox" 
                value="professional" 
                id="professional-checkbox" 
                v-model="filters['Users'].selectedRoles"
                @change="applyFilters"
              >
              </div>
              <div class="form-check">
              <label class="form-check-label" for="admin-checkbox">Admin</label>
              <input 
                class="form-check-input" 
                type="checkbox" 
                value="admin" 
                id="admin-checkbox" 
                v-model="filters['Users'].selectedRoles"
                @change="applyFilters"
              >
              </div>
          </div>
        <!-- Minimum Rating Filter -->
          <div class="mb-4">
                <p class="filter-label">Min Average Rating:</p>
                <input
                  type="range"
                  class="price-slider"
                  v-model="filters['Users'].minRating"
                  min="0"
                  max="5"
                  step="0.5"
                  @change="applyFilters"
                />
                <p>Average Rating: {{ filters['Users'].minRating }} ⭐</p>
              </div>
      </div>
    </div>
        <div class="col-md-9">
          <p v-if="isLoading">Loading service requests...</p>
          <div v-else>
          <p>{{ filteredRequests.length }} results found</p>
            <div
              v-for="request in paginatedRequests"
              :key="request.user_id"
              class="card mb-3"
              style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden;"
            >
              <div class="row g-0">
                <!-- Image Section -->
                <div class="col-md-2 d-flex align-items-center justify-content-center" style="background-color: #f8f9fa;">
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
                          <strong>Email:</strong> {{ request.email }}
                        </p>
                        <p class="text-primary mb-1">
                          <strong>User Phone:</strong> {{ request.phone }}
                        </p>
                        <p class="text-primary mb-1">
                        <strong>Service Area:</strong> {{ request.address }}
                        </p>
                        </div>
                        <!-- Service Details -->
                        <div class="col-md-5">
                        <p class="text-primary mb-1">
                        <strong>Average Rating:</strong> {{ request.avg_rating }} ⭐
                        </p>
                        <p class="text-primary mb-1">
                          <strong>Role:</strong> {{ request.role }}
                        </p>
                      </div>
                      <div class= "col-md-2 d-flex align-items-center justify-content-center">
                        <button 
                          class="btn btn-danger" 
                          data-bs-toggle="modal" 
                          data-bs-target="#deleteModal" 
                          @click="DeleteUser(request.user_id)">
                        Block
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div
              class="modal fade"
              id="deleteModal"
              tabindex="-1"
              aria-labelledby="deleteModalLabel"
              aria-hidden="true"
            >
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    Are you sure you want to block this user <b>{{ selectedUser }}</b>?
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="confirmDelete">Delete</button>
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
      requests: [],
      selectedUser: "",
      searchQuery: "",
      currentPage: 1,
      requestsPerPage: 10,
      isLoading: true,
      option: 'Service Requests',  
      filters: {
        'Service Requests':{
          startDate: "",
          endDate: "",
          minCustRating: 0,
          minProfRating: 0,
          selectedStatus: [],
        },
        'Users':{
          selectedRoles: [],
          minRating: 0,
        },
      },
      optionResult:{
          'Service Requests': [],
          'Users': []
      }
    };
  },
  computed: {
    filteredRequests() {
      const query = this.searchQuery.toLowerCase();
    
      if (this.option === 'Service Requests') {
        return this.requests.filter(request => {
          const matchesQuery = request.first_name?.toLowerCase().includes(query) ||
                               request.last_name?.toLowerCase().includes(query) ||
                               request.phone?.toString().includes(query) ||
                               request.srvc_status?.toLowerCase().includes(query) ||
                               request.srvcreq_id?.toString().includes(query) ||
                               request.email?.toLowerCase().includes(query);
    
          const matchesDate = (!this.filters['Service Requests'].startDate ||
                               new Date(request.date_cmpltreq) >= new Date(this.filters['Service Requests'].startDate)) &&
                              (!this.filters['Service Requests'].endDate ||
                               new Date(request.date_cmpltreq) <= new Date(this.filters['Service Requests'].endDate));
    
          const matchesCustRating = !this.filters['Service Requests'].minCustRating ||
                                    request.cust_rating >= this.filters['Service Requests'].minCustRating;
    
          const matchesProfRating = !this.filters['Service Requests'].minProfRating ||
                                    request.prof_rating >= this.filters['Service Requests'].minProfRating;
              
          const matchesStatus = this.filters['Service Requests'].selectedStatus.length === 0 ||
                                  this.filters['Service Requests'].selectedStatus.includes(request.srvc_status);
          return matchesQuery && matchesDate && matchesCustRating && matchesProfRating && matchesStatus;
        });
      }
    
      // Add checks for Users' filters
      const userFilters = this.filters.Users || { selectedRoles: [], minRating: 0 };
    
      return this.requests.filter(request => {
        const matchesQuery = request.first_name?.toLowerCase().includes(query) ||
                             request.last_name?.toLowerCase().includes(query) ||
                             request.phone?.toString().includes(query) ||
                             request.email?.toLowerCase().includes(query);
    
        const matchesRole = userFilters.selectedRoles.length === 0 ||
                            userFilters.selectedRoles.includes(request.role);
    
        const matchesRating = request.avg_rating >= userFilters.minRating;
    
        return matchesQuery && matchesRole && matchesRating;
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
    DeleteUser(user_id) { 
      this.selectedUser = user_id;
    },
    async confirmDelete() {
      console.log(`Deleting user with ID: ${this.selectedUser}`);
      // Example API call logic
      alert(`User with ID ${this.selectedUser} has been deleted.`);
      const userResponse = await axios.get("/api/user", {
        headers: {
          Authorization: "Bearer " + this.token,
        },
      });
      this.requests = JSON.parse(userResponse.data)['message'];
      this.optionResult['Users'] = this.requests;
    },
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
        this.optionResult['Service Requests'] = this.requests;
        const userResponse = await axios.get("/api/user", {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        });
        this.optionResult.Users = JSON.parse(userResponse.data)['message'];
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
      console.log(option);
      this.requests = this.optionResult[option];
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
      if (this.option === 'Service Requests') {
        this.filters['Service Requests'] = {
          startDate: "",
          endDate: "",
          minCustRating: 0,
          minProfRating: 0,
          selectedStatus: [],
        };
      } else if (this.option === 'Users') {
        this.filters.Users = {
          selectedRoles: [],
          minRating: 0,
        };
      }
      this.currentPage = 1;
    }    
  },
  async created() {
    await this.fetchServiceRequests();
  },
  components: { navbar, footerComp, searchHero, searchBar, noti },
});

export default adminSearch;
