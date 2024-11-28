const user_stats = Vue.component("user_stats", {
    template: `
    <div style="background-color: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.356); height: 2.5in;">
        <div style="font-size: 30px; margin:0 0 0 30px">Your Stats</div>
    
    </div>
    
    `,
    data() {
        return {
            token: localStorage.getItem("token"),
            user: localStorage.getItem("user"),
        }
    },
})

export default user_stats;