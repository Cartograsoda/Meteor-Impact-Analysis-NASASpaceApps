const API_BASE_URL = 'http://localhost:8080/api/neo';

export async function fetchNeoFeed(startDate = null, endDate = null) {
    let url = `${API_BASE_URL}/feed`;

    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

export async function fetchTodayFeed() {
    const response = await fetch(`${API_BASE_URL}/feed/today`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
}

export async function checkApiHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
}
