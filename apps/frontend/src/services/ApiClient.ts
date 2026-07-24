// src/services/ApiClient.ts
import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

export default class ApiClient {
  private client = axios.create({ baseURL: BASE_URL })

  constructor() {
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  get<T>(url: string, params?: any) { return this.client.get<T>(url, { params }).then(r => r.data) }
  post<T>(url: string, data?: any)   { return this.client.post<T>(url, data).then(r => r.data) }
  put<T>(url: string, data?: any)    { return this.client.put<T>(url, data).then(r => r.data) }
  del<T>(url: string)                { return this.client.delete<T>(url).then(r => r.data) }
}
