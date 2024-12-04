import navbar from "../components/navbar.js";
import footerman from "../components/footer.js";
import ModalForm from "../components/modal.js";

const Orders_view = Vue.component("orders_view", {
    template: `
    <div id="orders">
        <navbar/>
        <div v-if="token" class="container my-5">
            <h1 class="text-center mb-4">Your Orders</h1>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Order ID</th>
                            <th>Service Name</th>
                            <th>Requested Date</th>
                            <th>Completion Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(order,index) in orders" :key="order.srvcreq_id" >
                            <td>{{ index + 1 }}</td>
                            <td @click="navigatePage(order.srvcreq_id)" style="cursor: pointer;">{{ order.srvcreq_id }}</td>
                            <td>{{ titleCase(order.service_name) }}</td>
                            <td>{{ order.date_srvcreq }}</td>
                            <td>{{ order.date_cmpltreq }}</td>
                            <td :class="'bg-'+clr_map[order.srvc_status]">{{ titleCase(order.srvc_status) }}</td>
                            <td>
                                <button v-if="order.srvc_status === 'completed' && !order.cust_rating" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#reviewModal" @click="openReviewModal(order)">
                                    Leave a Review
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
         <div class="hero-section container" v-else>
            <h1 class="hero-title">
                Login to Enjoy Multiple Features
            </h1>
            <p class="hero-text">
                Access a wide range of features and services tailored to your needs. From household management to professional support, we've got you covered.
            </p>
            <RouterLink to="/login" class="btn btn-primary-custom">Get Started</RouterLink>
        </div>

        <modal-form 
            :type="'review'" 
            @submit="submitReview" 
            ref="reviewModal"/>
        <footerman/>
    </div>`,

    data() {
        return {
            token: localStorage.getItem("token"),
            orders: [],
            clr_map:{
                "rejected": "danger",
                "completed": "success",
                "accepted": "info",
                "pending": "warning",
              }
        };
    },

    methods: {
        navigatePage(id) {
            this.$router.push(`/service/${id}`);
        },

        titleCase(str) {
            return str
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        },

        openReviewModal(order) {
            this.$refs.reviewModal.selectedOrder = order;
        },

        async submitReview(data) {
            const { orderId, reviewText, rating } = data;

            if (!orderId || !reviewText || !rating) {
                alert("Please fill in all fields.");
                return;
            }

            try {
                await axios.post("/api/srvcreq", {
                    srvcreq_id: orderId,
                    review: reviewText,
                    rating: rating,
                }, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                });
                alert("Review submitted successfully!");
                this.$refs.reviewModal.close();
            } catch (error) {
                console.error("Error submitting review:", error);
                alert("Error submitting review. Please try again.");
            }
        },
    },

    async created() {
        if (this.token) {
            try {
                const data  = await axios.get("/api/srvcreq", {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                });
    
                if (data.status === 200) {
                    this.orders = JSON.parse(data.data).message;
                }
            } catch (error) {
                console.log(error);
                alert("Error fetching orders.");
            }
        }

    },

    components: { navbar, footerman, ModalForm }
});

export default Orders_view;