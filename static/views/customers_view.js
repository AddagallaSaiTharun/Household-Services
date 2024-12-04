import Navbar from "../components/navbar.js";
import Hero from "../components/hero.js";
import CategoryComponent from "../components/category.js";
import FooterMan from "../components/footer.js";

const CustomersView = Vue.component("CustomersView", {
  template: `
    <div id="root">
      <Navbar />
      <Hero />
      <CategoryComponent
        v-for="(category, index) in categories"
        :category="category"
        :key="category[0]?.category + '-' + index"
        :unique="index"
        v-if="index < 4"
      />
      <FooterMan />
    </div>
  `,
  data() {
    return {
      token: localStorage.getItem("token"),
      user: localStorage.getItem("user"),
      categories: [],
    };
  },
  async created() {
    try {
      const categoryResponse = await axios.get("/unique_categories");
      const categories = categoryResponse.data["categories"];
      
      for (const category of categories) {
        try {
          const serviceResponse = await axios.get("/api/service", {
            params: { category },
          });
          const serviceContent = JSON.parse(serviceResponse.data)["content"];
          this.categories.push(serviceContent);
        } catch (error) {
          console.error(`Error fetching services for category: ${category}`, error);
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },
  components: {
    Navbar,
    Hero,
    CategoryComponent,
    FooterMan,
  },
});

export default CustomersView;
