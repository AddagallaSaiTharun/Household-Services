
import prohome from "../components/professional/pro_home.js";

const Pro_view = Vue.component('Pro_view', {
    template: `
    <div>
        <prohome></prohome>
    </div>
    `,
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
        prohome,
    }
});

export default Pro_view;

