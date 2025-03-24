// API helper that chooses between real and mock API based on environment

import realApiClient from './apiClient';
import mockApiClient from './mockApiClient';

// Set this to true to force using mock API
const USE_MOCK_API = true;

// Select the appropriate API client
const api = USE_MOCK_API ? mockApiClient : realApiClient;

export default api; 