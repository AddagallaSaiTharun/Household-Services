const search_bar = Vue.component("search-bar", {
  props: {
    role: {
      type: Boolean,
      default: false,
    },
  },
  template: `
    <div class="container px-5 pb-5">
      <div class="search-container py-3">
        <i class="fas fa-search icon ps-5 pe-3"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search Services..."
          @input="onSearch">
        |
        <div v-if="!role" class="location-display">
          <i class="fas fa-map-marker-alt icon mx-3"></i>
          <span class="mx-3">New York, NY</span>
        </div>
        <div v-else class="dropdown">
          <button 
            class="btn btn-secondary dropdown-toggle mx-3" 
            type="button" 
            id="dropdownMenuButton" 
            data-bs-toggle="dropdown" 
            aria-expanded="false">
            {{ option }}
          </button>
          <ul class="dropdown-menu dropdown-menu-custom mx-3" aria-labelledby="dropdownMenuButton">
            <li>
              <a 
                class="dropdown-item" 
                @click="selectOption('Service Requests')">
                Service Requests
              </a>
            </li>
            <li>
              <a 
                class="dropdown-item" 
                @click="selectOption('Users')">
                Users
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      searchQuery: '',
      option: 'Service Requests',
    };
  },
  methods: {
    onSearch() {
      this.$emit('update-search', this.searchQuery);
    },
    selectOption(option) {
      this.option = option; 
      this.$emit('update-option', this.option); 
    },
  },
});

export default search_bar;
