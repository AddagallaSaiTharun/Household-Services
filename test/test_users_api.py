# tests/test_user_api.py

import json
from unittest.mock import patch

# Test for IsPro
@patch('application.utils.validation.preprocesjwt', return_value=(1235, "professional", None, None))
async def test_is_pro_professional(mock_preprocesjwt, client, init_database):
    """
    Test if the professional role is correctly identified.
    """
    response = await client.get('/api/ispro')
    assert response.status_code == 200
    assert response.json is True


@patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
async def test_is_pro_non_professional(mock_preprocesjwt, client, init_database):
    """
    Test if a non-professional role returns False.
    """
    response = await client.get('/api/ispro')
    assert response.status_code == 200
    assert response.json is False


# Test for IsAdmin
@patch('application.utils.validation.preprocesjwt', return_value=(12, "admin", None, None))
async def test_is_admin_true(mock_preprocesjwt, client, init_database):
    """
    Test if the admin role is correctly identified.
    """
    response = await client.get('/api/isadmin')
    assert response.status_code == 200
    assert response.json is True


@patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
async def test_is_admin_false(mock_preprocesjwt, client, init_database):
    """
    Test if a non-admin role returns False.
    """
    response = await client.get('/api/isadmin')
    assert response.status_code == 200
    assert response.json is False


# Tests for UserAPI
@patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
async def test_get_user_user_role(mock_preprocesjwt, client, init_database):
    """
    Test fetching user details as a regular user.
    """
    response = await client.get('/api/users')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert "message" in data
    assert data["message"]["email"] == "test@example.com"


@patch('application.utils.validation.preprocesjwt', return_value=(12, "admin", None, None))
async def test_get_all_users_admin(mock_preprocesjwt, client, init_database):
    """
    Test fetching all users as an admin.
    """
    response = await client.get('/api/users')
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert "message" in data
    assert len(data["message"]) > 0


@patch('application.utils.validation.preprocesjwt', return_value=(1234, "user", None, None))
async def test_update_user_profile(mock_preprocesjwt, client, init_database):
    """
    Test updating a user profile as a regular user.
    """
    update_data = {
        'email': 'test@example.com',
        'first_name': 'UpdatedFirst',
        'last_name': 'UpdatedLast'
    }
    
    response = await client.put('/api/users', json=update_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "User updated successfully"


@patch('application.utils.validation.preprocesjwt', return_value=(1, "admin", None, None))
async def test_update_user_as_admin(mock_preprocesjwt, client, init_database):
    """
    Test updating a user profile as an admin.
    """
    update_data = {
        'user_id': 1234,
        'role': 'user',
        'first_name': 'AdminUpdatedFirst'
    }
    
    response = await client.put('/api/users', json=update_data)
    data = json.loads(response.data)
    
    assert response.status_code == 200
    assert data["message"] == "User updated successfully"


@patch('application.utils.validation.preprocesjwt', return_value=(1, "admin", None, None))
async def test_create_user(mock_preprocesjwt, client):
    """
    Test creating a new user.
    """
    user_data = {
        'email': 'newuser@example.com',
        'first_name': 'NewUser',
        'password': 'newpassword123',
        'phone': '1234567890',
        'address': '123 New St',
        'pincode': '123456'
    }
    
    response = await client.post('/api/users', json=user_data)
    data = json.loads(response.data)
    
    assert response.status_code == 201
    assert data["message"] == "success"
    assert data["email"] == "newuser@example.com"
