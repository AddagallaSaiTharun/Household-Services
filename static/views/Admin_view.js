import admin_home from "../components/admin/admin_home.js";


const Admin_view = Vue.component("Admin_view", {
    template: `
    <div>
        <admin_home></admin_home>
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
        admin_home
    }
});

export default Admin_view;
