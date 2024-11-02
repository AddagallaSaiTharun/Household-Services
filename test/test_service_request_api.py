# # tests/test_service_request_api.py

# import json
# from datetime import datetime
# from unittest.mock import patch

# @patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
# async def test_get_service_requests_user(client, init_database, mocker):
#     # Mock user as a customer
#     response = await client.get('/api/service_requests')
#     data = json.loads(response.data)

#     assert response.status_code == 200
#     assert "message" in data
#     assert len(data["message"]) > 0
#     assert data["message"][0]["srvcreq_id"] == 11


# @patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
# async def test_create_service_request(client, init_database, mocker):
#     # Mock user as a customer
    
#     response = await client.post('/api/service_requests', json={
#         'srvc_id': 101,
#         'prof_id': 1235,
#         'remarks': 'New service request'
#     })
#     data = json.loads(response.data)

#     assert response.status_code == 201
#     assert data["message"] == "Service request created successfully"
#     assert "srvcreq_id" in data


# @patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
# async def test_update_service_request_user(client, init_database, mocker):
#     # Mock user as a customer
    
#     response = await client.put('/api/service_requests', json={
#         'srvcreq_id': 1,
#         'cust_rating': 5,
#         'cust_review': 'Great service'
#     })
#     data = json.loads(response.data)

#     assert response.status_code == 200
#     assert data["message"] == "Service request updated successfully"


# @patch('application.utils.validation.preprocesjwt', return_value=(1235, "professional", None, None))
# async def test_update_service_request_professional(client, init_database, mocker):
#     # Mock user as a professional
    
#     response = await client.put('/api/service_requests', json={
#         'srvcreq_id': 1,
#         'prof_rating': 4,
#         'prof_review': 'Good customer'
#     })
#     data = json.loads(response.data)

#     assert response.status_code == 200
#     assert data["message"] == "Service request updated successfully"
