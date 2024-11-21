const summmary_view = Vue.component("summmary_view", {
    template: ``,
    data() {
      return {
        token: localStorage.getItem("token"),
        user: localStorage.getItem("user"),
      };
    },
    computed: {
    },
    created() {
      
    },
    methods: {

    },
    components: {

    }
  });
  
  export default summmary_view;
  