import { Scene } from 'phaser';

export type ToastType = 'info' | 'success' | 'error';

interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

/**
 * Shows a toast notification in a Phaser scene
 * @param scene The Phaser scene to show the toast in
 * @param message The message to display
 * @param options Optional configuration for the toast
 */
export function showToast(
  scene: Scene,
  message: string,
  options: ToastOptions = {}
): void {
  // In test environment, scene.add.container might not exist
  if (!scene.add || typeof scene.add.container !== 'function') {
    console.log(`[Toast ${options.type || 'info'}] ${message}`);
    return;
  }

  const { type = 'info', duration = 3000 } = options;

  const { width, height } = scene.scale;

  // Get background color based on type
  const bgColors = {
    info: '#3498db',
    success: '#27ae60',
    error: '#e74c3c',
  };

  // Create container for the toast
  const container = scene.add.container(width / 2, height * 0.15);
  container.setDepth(10000); // Ensure it's on top of everything

  // Create background
  const padding = 20;
  const maxWidth = width * 0.8;

  // Create temporary text to measure size
  const tempText = scene.add.text(0, 0, message, {
    fontFamily: 'Arial',
    fontSize: '18px',
    color: '#ffffff',
    align: 'center',
    wordWrap: { width: maxWidth - padding * 2 },
  });

  const textWidth = Math.min(tempText.width, maxWidth - padding * 2);
  const textHeight = tempText.height;

  // Create background rectangle
  const bgWidth = textWidth + padding * 2;
  const bgHeight = textHeight + padding * 2;

  const background = scene.add.rectangle(
    0,
    0,
    bgWidth,
    bgHeight,
    parseInt(bgColors[type].replace('#', '0x'))
  );
  background.setStrokeStyle(2, 0x000000);

  // Update text position
  tempText.setPosition(-textWidth / 2, -textHeight / 2);

  // Add to container
  container.add([background, tempText]);

  // Animate in
  container.setAlpha(0);
  container.setScale(0.8);

  scene.tweens.add({
    targets: container,
    alpha: 1,
    scale: 1,
    duration: 300,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Auto-dismiss after duration
      scene.time.delayedCall(duration, () => {
        scene.tweens.add({
          targets: container,
          alpha: 0,
          scale: 0.8,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
            container.destroy();
          },
        });
      });
    },
  });
}
