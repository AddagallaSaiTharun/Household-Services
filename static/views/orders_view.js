// Table containg all the orders of the user
import navbar from "../components/navbar.js";
import footerman from "../components/footer.js";

const Orders_view = Vue.component("orders_view",{
    template:`
    <div id="orders">
    <navbar/>
    <h1>Your Orders</h1>
    <footerman/>
    </div>`,
    data(){
        return {
            orders:[]
        };
    },
    methods:{

    },
    components:{navbar,footerman}
});
export default Orders_view;