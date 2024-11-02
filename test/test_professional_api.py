# tests/test_professional_api.py

import json
from unittest.mock import patch
from datetime import datetime

@patch('application.utils.validation.preprocesjwt', return_value=(12, "admin", None, None))
async def test_get_professionals_admin(mock_preprocesjwt, client, init_database):
    response = await client.get('/api/professionals')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert "message" in data
    assert len(data["message"]) > 0
    assert data["message"][0]["prof_userid"] == 1235


@patch('application.utils.validation.preprocesjwt', return_value=(1234, "professional", None, None))
async def test_update_professional_self(mock_preprocesjwt, client, init_database):
    update_data = {
        'prof_exp': '6 years',
        'prof_dscp': 'Updated Professional Experience'
    }
    
    response = await client.put('/api/professionals', json=update_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "Professional updated successfully"


@patch('application.utils.validation.preprocesjwt', return_value=(12, "admin", None, None))
async def test_update_professional_admin(mock_preprocesjwt, client, init_database):
    update_data = {
        'prof_userid': 2,
        'prof_exp': '10 years',
        'prof_dscp': 'Admin Updated Experience'
    }
    
    response = await client.put('/api/professionals', json=update_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "Professional updated successfully"


@patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
async def test_create_professional_user(mock_preprocesjwt, client, init_database):
    response = await client.post('/api/professionals', data={
        'prof_exp': '2 years',
        'prof_dscp': 'New Professional',
        'prof_srvcid': 102,
        'prof_join_date': '2023-01-01'
    })
    data = json.loads(response.data)
    
    assert response.status_code == 201
    assert data["message"] == "Professional created successfully"
    assert "prof_userid" in data


@patch('application.utils.validation.preprocesjwt', return_value=(12, "admin", None, None))
async def test_delete_professional_admin(mock_preprocesjwt, client, init_database):
    delete_data = {'prof_userid': 1234}
    
    response = await client.delete('/api/professionals', json=delete_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "Professional '2' deleted successfully"
