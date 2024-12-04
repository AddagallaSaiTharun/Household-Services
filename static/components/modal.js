const ModalForm = Vue.component('modal-form', {
    props: ['type'],
    data() {
        return {
            selectedOrder: {
                srvcreq_id:  '',
                remarks: '',
                cust_review: '',
                cust_rating: ''
            }
        };
    },
    methods: {
        open() {
            $([`#${this.type}Modal`]).modal('show');
        },

        close() {
            $([`#${this.type}Modal`]).modal('hide');    
        },

        submit() {
            this.$emit('submit', {
                orderId: this.orderID,
                reviewText: this.reviewText,
                rating: this.rating,
            });
        }
    },
    template: `
    <div class="modal fade" :id="type + 'Modal'" tabindex="-1" :aria-labelledby="type + 'ModalLabel'" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" :id="type + 'ModalLabel'">{{ type === 'review' ? 'Leave a Review' : 'Edit Service Request' }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="submit">
                        <div class="mb-3">
                            <label for="orderID" class="form-label">Order ID</label>
                            <input type="text" v-model="selectedOrder.srvcreq_id" class="form-control" readonly />
                        </div>

                        <div v-if="type === 'review'" class="mb-3">
                            <label for="customerReview" class="form-label">Review</label>
                            <textarea v-model="selectedOrder.cust_review" class="form-control" rows="3" placeholder="Write your review here..."></textarea>
                        </div>

                        <div v-if="type === 'review'" class="mb-3">
                            <label for="customerRating" class="form-label">Rating</label>
                            <select v-model="selectedOrder.cust_rating" class="form-select">
                                <option value="" disabled>Select Rating</option>
                                <option value="5">5 - Excellent</option>
                                <option value="4">4 - Very Good</option>
                                <option value="3">3 - Good</option>
                                <option value="2">2 - Fair</option>
                                <option value="1">1 - Poor</option>
                            </select>
                        </div>

                        <button type="submit" class="btn btn-primary">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </div>`
});
export default ModalForm;