import { apiSettings } from '../config'
const apiBase = apiSettings.neteaseApiBase
async function getQrCodeKey(): Promise<string> {
  const response = await fetch(`${apiBase}/login/qr/key?timestamp=${Date.now()}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()
  return data.data.unikey as string
}

async function createQrCodeImage(key: string): Promise<string> {
  const response = await fetch(
    `${apiBase}/login/qr/create?key=${key}&qrimg=true&timestamp=${Date.now()}`
  )
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  const data = await response.json()
  return data.data.qrimg as string
}

interface CheckQrCodeStatusResponse {
  code: number
  message: string
  cookie?: string
}

async function checkQrCodeStatus(key: string): Promise<CheckQrCodeStatusResponse> {
  const response = await fetch(`${apiBase}/login/qr/check?key=${key}&timestamp=${Date.now()}`)
  if (!response.ok) {
    // Netease API might return 502, handle it as a specific case if needed
    throw new Error(`Network response was not ok, status: ${response.status}`)
  }
  return (await response.json()) as CheckQrCodeStatusResponse
}

interface CaptchaResponse {
  code: number
  data: boolean
}

async function sendCaptcha(phone: string): Promise<CaptchaResponse> {
  const response = await fetch(`${apiBase}/captcha/sent?phone=${phone}&timestamp=${Date.now()}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return await response.json()
}

interface LoginResponse {
  cookie: string
  // Add other properties from the login response as needed
}

async function loginByCellphone(
  phone: string,
  captcha?: string,
  password?: string
): Promise<LoginResponse> {
  let url = `${apiBase}/login/cellphone?phone=${phone}&timestamp=${Date.now()}`
  if (captcha) {
    url += `&captcha=${captcha}`
  } else if (password) {
    url += `&password=${password}`
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Network response was not ok, status: ${response.status}`)
  }
  return (await response.json()) as LoginResponse
}

export const functions = {
  getQrCodeKey,
  createQrCodeImage,
  checkQrCodeStatus,
  sendCaptcha,
  loginByCellphone
}
