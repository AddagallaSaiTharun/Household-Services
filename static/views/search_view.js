import navbar from "../components/navbar.js";
import footer_comp from "../components/footer.js";
import search_hero from "../components/search_hero.js";
import search_bar from "../components/search-bar.js";
import noti from "../components/notification.js";

const search_view = Vue.component("search_view", {
  template: `
    <div id="search">
      <navbar />
      <search_hero />
      <search-bar @update-search="updateSearchQuery"></search-bar>

      <div class="container my-4">
        <div class="row">
          <!-- Filter Section -->
          <div class="col-md-3">
            <div class="filter-section">
              <h5 class="filter-title text-center">Filter</h5>
              <hr>
              <!-- Category Filter -->
              <div class="mb-4">
                <p class="filter-label">Category</p>
                <div v-for="category in availableCategories" :key="category">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :value="category" 
                      v-model="selectedCategories"
                      @change="applyFilters">
                    <label class="form-check-label">{{ category }}</label>
                  </div>
                </div>
              </div>
              <hr>
              <!-- Pricing Filter -->
              <div class="mb-4">
                <p class="filter-label">Pricing</p>
                <input
                  type="range"
                  class="price-slider"
                  v-model="priceRange"
                  min="0"
                  max="1000"
                  step="50"
                  @change="applyFilters"
                />
                <p>Max Price: ₹{{ priceRange }}</p>
              </div>
            </div>
          </div>
          <!-- Results Section -->
          <div class="col-md-9">
            <p>{{ filteredServices.length }} results found</p>

            <!-- Result Cards -->
            <div 
              v-for="service in paginatedServices" 
              :key="service.service_id" 
              class="result-card d-flex mb-3"
              @click="redirectToService(service.service_id)">
              <img 
                :src="'data:image/jpeg;base64,' + service.service_image || 'static/images/default_service.jpg'" 
                alt="Service Image" 
                class="img-thumbnail" 
                style="width: 250px; height: 150px;">
              <div class="result-content ms-3">
                <p class="text-primary mb-1">From ₹{{ service.service_base_price }}</p>
                <h6>{{ service.service_name }}</h6>
                <p>{{ service.service_dscp }}</p>
              </div>
            </div>

            <!-- Pagination -->
            <nav class="d-flex justify-content-end">
              <ul class="pagination mt-3">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
                </li>
                <li 
                  class="page-item" 
                  v-for="page in totalPages" 
                  :key="page" 
                  :class="{ active: page === currentPage }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <noti></noti>
      <footer_comp />
    </div>
  `,
  
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      services: [],
      searchQuery: "",
      selectedCategories: [],
      priceRange: 500,
      currentPage: 1,
      servicesPerPage: 10,
      availableCategories: [],
    };
  },
  
  computed: {
    filteredServices() {
      return this.services.filter(service => {
        const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(service.category);
        const matchesQuery = this.searchQuery === "" || service.service_name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesPrice = service.service_base_price <= this.priceRange;

        return matchesCategory && matchesQuery && matchesPrice;
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
    redirectToService(id) {
      this.$router.push(`/service/${id}`);
    },
    
    updateSearchQuery(query) {
      this.searchQuery = query;
      this.currentPage = 1; 
    },
    
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    applyFilters() {
      this.currentPage = 1; 
    },

    async fetchServices() {
      try {
        const response = await axios.get("api/service");
        this.services = JSON.parse(response.data)["content"];
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    async fetchCategories() {
      try {
        const response = await axios.get("/unique_categories");
        this.availableCategories = response.data["categories"];
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
  },

  async created() {
    await this.fetchServices();
    await this.fetchCategories();
  },

  components: { navbar, footer_comp, search_hero, search_bar, noti },
});

export default search_view;
