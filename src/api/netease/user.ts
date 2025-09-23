import axios from 'axios';
import { apiSettings } from '../config';

const neteaseApiBase = apiSettings.neteaseApiBase;

export const getUserDetail = (uid: number) => {
  return axios.get(`${neteaseApiBase}/user/detail`, {
    params: { uid },
  });
};

export const getUserPlaylist = (uid: number, limit: number = 30, offset: number = 0) => {
  return axios.get(`${neteaseApiBase}/user/playlist`, {
    params: { uid, limit, offset },
  });
};
