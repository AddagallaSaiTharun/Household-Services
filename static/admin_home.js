const admin_home = Vue.component("admin-home", {
    template:  `
    <div>
    <h2>This is the admin page</h2>
    <button class= "btn btn-primary" @click="add_service">Add_Service</button>
    </div>
    `,
    methods: {
        add_service() {
            window.location.href = "/#/add_service";
        }
    },

})


export default admin_home