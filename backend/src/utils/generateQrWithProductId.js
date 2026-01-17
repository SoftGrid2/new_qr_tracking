import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

const QR_SIZE = 500;
const PADDING = 40;
const FONT_SIZE = 28;
const FONT_FAMILY = 'Arial';

/**
 * Generate a PNG buffer containing QR code with productId printed below.
 * QR content: https://mydomain.com/verify?pid=<productId>
 */
export const generateQrPngWithProductId = async (productId) => {
  // const url = `https://new-qr-tracking.onrender.com/api/scan/verify?pid=${productId}`;
  const url = `${process.env.FRONTEND_URL}/verify?pid=${productId}`;

  const qrCanvas = createCanvas(QR_SIZE, QR_SIZE);
  await QRCode.toCanvas(qrCanvas, url, {
    errorCorrectionLevel: 'H',
    margin: 2,
  });

  const text = `Product ID: ${productId}`;
  const textCanvas = createCanvas(QR_SIZE + PADDING * 2, QR_SIZE + 120);
  const ctx = textCanvas.getContext('2d');

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

  // Draw QR centered at top
  const qrX = (textCanvas.width - QR_SIZE) / 2;
  ctx.drawImage(qrCanvas, qrX, PADDING, QR_SIZE, QR_SIZE);

  // Draw productId text below QR
  ctx.fillStyle = '#000000';
  ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const textX = textCanvas.width / 2;
  const textY = PADDING + QR_SIZE + 20;
  ctx.fillText(text, textX, textY);

  return textCanvas.toBuffer('image/png');
};

