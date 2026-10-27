import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  token?: string | null;
};

const FIELD_MESSAGES: Record<string, string> = {
  username: 'ชื่อบัญชีต้องมีอย่างน้อย 6 ตัวอักษร',
  email: 'รูปแบบอีเมลไม่ถูกต้อง',
  password: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
};

const THAI_PATTERN = /[\u0E00-\u0E7F]/;

// แปลง detail ที่ FastAPI ส่งมา (string หรือ array ตอน 422) ให้เป็นข้อความอ่านง่าย
function readDetail(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    const messages = detail.map((item: any) => {
      const msg =
        typeof item?.msg === 'string' ? item.msg.replace(/^Value error, /, '') : '';
      if (THAI_PATTERN.test(msg)) {
        return msg;
      }
      const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : undefined;
      return FIELD_MESSAGES[field as string] ?? 'ข้อมูลไม่ถูกต้อง';
    });
    return Array.from(new Set(messages)).join('\n');
  }
  return 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า Backend เปิดอยู่', 0);
  } finally {
    clearTimeout(timer);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(readDetail(data?.detail), response.status);
  }
  return data as T;
}