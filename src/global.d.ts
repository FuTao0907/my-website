/**
 * 全局类型声明（v1.2）
 * BaseLayout 注入的 window.showToast（统一 Toast，P2-9）
 */
interface Window {
  showToast(message: string, type?: 'success' | 'error'): void;
}
