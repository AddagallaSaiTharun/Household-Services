# tests/test_service_api.py

import json
import base64
from io import BytesIO
import pytest


async def test_get_all_services(client, init_database):
    """
    Test retrieving all services.
    """
    response = await client.get('/api/service')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert "content" in data
    assert len(data["content"]) > 0
    assert data["content"][0]["service_name"] == "Test Service"


async def test_get_service_with_filters(client, init_database):
    """
    Test retrieving services with specific filters.
    """
    response = await client.get('/api/service?service_name=Test Service')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert len(data["content"]) == 1
    assert data["content"][0]["service_name"] == "Test Service"


async def test_create_service(client, init_database):
    """
    Test creating a new service with image upload.
    """
    # Mock an image file for upload
    image_data = base64.b64encode(b"dummy_image_data").decode('utf-8')
    files = {'service_image': (BytesIO(b"dummy_image_data"), 'image.png')}
    
    response = await client.post('/api/service', data={
        'service_name': 'New Service',
        'time_req': 45,
        'service_base_price': 150,
        'service_dscp': 'New service description'
    }, files=files)
    
    data = json.loads(response.data)

    assert response.status_code == 201
    assert data["message"] == "Service created successfully"
    assert data["service_name"] == "New Service"


async def test_update_service(client, init_database):
    """
    Test updating an existing service.
    """
    update_data = {
        'service_name': 'Test Service',
        'time_req': '60 mins',
        'service_base_price': 120,
        'service_dscp': 'Updated service description'
    }
    
    response = await client.put('/api/service', json=update_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "Service updated successfully"


async def test_delete_service(client, init_database):
    """
    Test deleting an existing service.
    """
    delete_data = {'service_name': 'Test Service'}
    
    response = await client.delete('/api/service', json=delete_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "Service 'Test Service' deleted successfully"
