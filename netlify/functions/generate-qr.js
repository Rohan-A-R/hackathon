const QRCode = require('qrcode');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { type, data } = JSON.parse(event.body);

    let qrData;
    let filename;

    switch (type) {
      case 'checkin':
        qrData = JSON.stringify({
          type: 'event_checkin',
          eventId: data.eventId,
          speakerId: data.speakerId,
          timestamp: Date.now()
        });
        filename = `checkin-${data.speakerName || 'speaker'}.png`;
        break;

      case 'tshirt':
        qrData = JSON.stringify({
          type: 'tshirt_collection',
          speakerId: data.speakerId,
          size: data.size || 'M',
          timestamp: Date.now()
        });
        filename = `tshirt-${data.speakerName || 'speaker'}.png`;
        break;

      case 'session':
        qrData = JSON.stringify({
          type: 'session_info',
          sessionId: data.sessionId,
          speakerId: data.speakerId,
          eventId: data.eventId,
          timestamp: Date.now()
        });
        filename = `session-${data.sessionId}.png`;
        break;

      case 'feedback':
        qrData = JSON.stringify({
          type: 'session_feedback',
          sessionId: data.sessionId,
          eventId: data.eventId,
          timestamp: Date.now()
        });
        filename = `feedback-${data.sessionId}.png`;
        break;

      default:
        // Generic QR code
        qrData = JSON.stringify(data);
        filename = 'qr-code.png';
    }

    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(qrData, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'max-age=3600'
      },
      body: qrCodeBuffer.toString('base64'),
      isBase64Encoded: true
    };

  } catch (error) {
    console.error('QR Code generation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate QR code',
        details: error.message
      }),
    };
  }
};