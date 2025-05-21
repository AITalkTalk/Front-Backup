import axios from 'axios';
import Config from 'react-native-config';

const API = axios.create({
  baseURL: Config.API_URL,
  withCredentials: true,
});

export default API;
