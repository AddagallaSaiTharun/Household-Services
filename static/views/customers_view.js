import navbar from "../components/navbar.js";
import hero from "../components/hero.js";
import category_component from "../components/category.js";
import footerman from "../components/footer.js";

const customers_view = Vue.component("customers_view", {
    template: `
            <div id="root">
            <hero></hero>
            <category_component v-for="category in categories" :category="category" :key="category[0]?.category"></category_component>
            <footerman/> 


            </div>
        `,
        data() {
        return {
          token: localStorage.getItem("token"),
          user: localStorage.getItem("user"),
          categories: []
        };
      },
      async created() {
        await axios.get("/unique_categories").then((response) => {
            for (let i = 0; i < response.data["categories"].length; i++) {
                axios.get("/api/service",{
                  params:{
                    "category": response.data["categories"][i]
                  }
                }).then((response) =>{
                    this.categories.push(JSON.parse(response.data)["content"]);
                })
            }
        })
      },
    
      methods: {},
    components: { navbar,hero,category_component, footerman },
});
export default customers_view;