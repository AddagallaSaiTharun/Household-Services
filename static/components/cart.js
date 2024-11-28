import navbar from "./navbar.js";
import footerman from "./footer.js";
const cart = Vue.component('cart',{
    template: `
    <div id="cart">
        <navbar/>
        <h1>Your Cart</h1>
        <footerman/>
    </div>`,
    components:{navbar,footerman}
});
export default cart;