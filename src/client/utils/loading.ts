/**
 * Loading dialog utility for displaying loading indicators during async operations
 */

let loadingElement: HTMLDivElement | null = null;
let backdropElement: HTMLDivElement | null = null;

/**
 * Show a loading dialog with a message
 * @param message - The message to display (default: "Loading...")
 */
export function showLoading(message: string = 'Loading...'): void {
  // Remove existing loading dialog if present
  hideLoading();

  // Create backdrop
  backdropElement = document.createElement('div');
  backdropElement.id = 'loading-backdrop';
  backdropElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create loading container
  loadingElement = document.createElement('div');
  loadingElement.id = 'loading-dialog';
  loadingElement.style.cssText = `
    background: white;
    padding: 30px 40px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    text-align: center;
    font-family: Arial, sans-serif;
  `;

  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.cssText = `
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px auto;
  `;

  // Add keyframe animation for spinner
  if (!document.getElementById('loading-spinner-style')) {
    const style = document.createElement('style');
    style.id = 'loading-spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // Create message text
  const messageText = document.createElement('div');
  messageText.textContent = message;
  messageText.style.cssText = `
    color: #333;
    font-size: 18px;
    font-weight: bold;
  `;

  loadingElement.appendChild(spinner);
  loadingElement.appendChild(messageText);
  backdropElement.appendChild(loadingElement);
  document.body.appendChild(backdropElement);
}

/**
 * Hide the loading dialog
 */
export function hideLoading(): void {
  if (backdropElement) {
    backdropElement.remove();
    backdropElement = null;
  }
  if (loadingElement) {
    loadingElement.remove();
    loadingElement = null;
  }
}

/**
 * Execute an async function with loading indicator
 * @param fn - The async function to execute
 * @param message - The loading message to display
 * @returns The result of the async function
 */
export async function withLoading<T>(
  fn: () => Promise<T>,
  message: string = 'Loading...'
): Promise<T> {
  showLoading(message);
  try {
    const result = await fn();
    return result;
  } finally {
    hideLoading();
  }
}
