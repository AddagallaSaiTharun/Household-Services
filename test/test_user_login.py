# tests/test_user_login.py

import json

async def test_user_login_success(client, init_database):
    """
    Test login with correct credentials.
    """
    response = await client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'testpass'
    })
    data = json.loads(response.data)

    assert response.status_code == 200
    assert 'token' in data
    assert data['message'] == 'Login successful'
    assert data['name'] == 'Test'
    assert data['role'] == 'user'


async def test_user_login_invalid_password(client, init_database):
    """
    Test login with incorrect password.
    """
    response = await client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'wrongpassword'
    })
    data = json.loads(response.data)

    assert response.status_code == 401
    assert data['message'] == 'Invalid credentials'


async def test_user_login_nonexistent_user(client, init_database):
    """
    Test login with a non-existent user.
    """
    response = await client.post('/api/login', json={
        'email': 'nonexistent@example.com',
        'password': 'password123'
    })
    data = json.loads(response.data)

    assert response.status_code == 401
    assert data['message'] == 'Invalid credentials'


async def test_user_login_missing_body(client):
    """
    Test login with missing request body.
    """
    response = await client.post('/api/login', data={})
    data = json.loads(response.data)

    assert response.status_code == 400
    assert data['error'] == 'Missing request body'
