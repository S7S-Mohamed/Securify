import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true, 
});

const apiService = {
  login(credentials) {
    return apiClient.post('/login', credentials);
  },
  register(userInfo) {
    return apiClient.post('/register', userInfo);
  },
  checkSession() {
    return apiClient.get('/content'); 
  },
  getContent() {
    return apiClient.get('/content');
  },
  getQuiz() {
    return apiClient.get('/quiz');
  },
  submitQuiz(answers) {
    return apiClient.post('/quiz', answers);
  },
  updateProfile(profileData) {
    return apiClient.put('/user/profile', profileData);
  },
  updatePassword(passwordData) {
    return apiClient.put('/user/password', passwordData);
  },
  updateLevel(levelData) {
    return apiClient.put('/user/level', levelData);
  }
};

export default apiService;

export const API_URL = "http://localhost:5000/api";