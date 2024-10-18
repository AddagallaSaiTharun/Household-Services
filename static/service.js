const service = Vue.component("service", {
    template: `
    <div>
        <div v-if="service">
            {{ service.service_name }}
        </div>

    
    </div>
    `,
    
    
    data() {
        return {
            token: localStorage.getItem("token"),
            service_id: this.$route.params.id,
            service: undefined,
        }
    },
    async created() {
        if (!this.token) {
            window.location.href = "/#/login";
        }
        this.service = await axios.get("/api/service",{
            params: {
                service_id: this.service_id,
            },
            headers: {
                Authorization: "Bearer " + this.token,
            },
        });
        this.service = JSON.parse(this.service.data).content[0]
        

    },
})


export default service;
