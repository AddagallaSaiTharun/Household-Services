const search_bar = Vue.component("search-bar",{
    template:`
    <div class="container px-5 pb-5">
    <div class="search-container py-3">
    <i class="fas fa-search icon ps-5 pe-3"></i>
    <input 
      v-model="searchQuery" 
      type="text" 
      placeholder="Search Services..."
      @input="onSearch">
    |
    <a>
      <i class="fas fa-map-marker-alt icon mx-3"></i>
      <span class="mx-3">New York, NY</span>
    </a>
  </div>
  </div>
  `,
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: {
    onSearch() {
      this.$emit('update-search', this.searchQuery);
    },
  },
});
export default search_bar;