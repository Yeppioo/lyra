/**
 * 防抖函数 - 通用工具函数
 * @param func 需要防抖的函数
 * @param delay 延迟时间，单位毫秒
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    // 如果已有定时器，清除它
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default debounce;
