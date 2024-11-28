const category_component = Vue.component("category", {
    props: ["category"],
    template: `
      <div class="container-fluid my-5 shadow">
        <div :id="category[0]?.category + 'Carousel'" class="carousel slide mx-5" data-bs-ride="carousel">
          <div class="carousel-indicators" style="z-index: 10">
            <button 
              v-for="(chunk, index) in serviceChunks" 
              :key="'indicator-' + index" 
              type="button" 
              :data-bs-target="'#' + category[0]?.category + 'Carousel'" 
              :data-bs-slide-to="index" 
              :class="{ active: index === 0 }"
              :aria-label="'Slide ' + (index + 1)">
            </button>
          </div>
          <h1 class="mt-4 text-center">{{ category[0]?.category }}</h1>
          <div class="carousel-inner p-5">
            <div 
              v-for="(chunk, index) in serviceChunks" 
              :key="'chunk-' + index" 
              :class="['carousel-item', { active: index === 0 }]">
              <div class="row row-cols-2">
                <div v-for="service in chunk" :key="service.service_id" class="col">
                  <div class="card mb-3 border-0">
                    <div class="row g-0">
                      <div class="col-9">
                        <div class="card-body">
                          <h5 class="card-title fw-bold">{{ service.service_name }}</h5>
                          <p class="card-text fst-italic">{{ service.service_dscp }}</p>
                          <button class="btn btn-custom-outline p-2">Book Now</button>
                        </div>
                      </div>
                      <div class="col-3 d-flex align-items-center p-3">
                        <img 
                          :src="'data:image/jpg;base64,'+service.service_image || 'static/images/default_service.jpg'" 
                          class="img-fluid rounded-start" 
                          alt="Service Image">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user"),
      };
    },
    computed: {
      serviceChunks() {
        // Divide services into chunks of 4
        if (!this.category || this.category.length === 0) return [];
        const chunkSize = 4;
        const chunks = [];
        for (let i = 0; i < this.category.length; i += chunkSize) {
          chunks.push(this.category.slice(i, i + chunkSize));
        }
        return chunks;
      },
    },
    created() {
      
    },
    methods: {},
  });
  
  export default category_component;
  