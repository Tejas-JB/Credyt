import { NextResponse } from 'next/server';

// In-memory store for price alerts (would be a database in a real application)
const priceAlerts = [
  {
    id: '1',
    cryptoName: 'Bitcoin',
    cryptoSymbol: 'BTC',
    currentPrice: '$84,704.95',
    price: '90000',
    alertType: 'above',
    frequency: 'once',
    email: 'demo@example.com',
    createdAt: new Date().toISOString(),
    active: true
  },
  {
    id: '2',
    cryptoName: 'Ethereum',
    cryptoSymbol: 'ETH',
    currentPrice: '$3,071.19',
    price: '2000',
    alertType: 'below',
    frequency: 'daily',
    email: 'demo@example.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    active: true
  },
  {
    id: '3',
    cryptoName: 'Solana',
    cryptoSymbol: 'SOL',
    currentPrice: '$175.23',
    price: '200',
    alertType: 'above',
    frequency: 'always',
    email: 'demo@example.com',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    active: false
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, cryptoSymbol, cryptoName, price, alertType, frequency, currentPrice } = body;
    
    // Validate required fields
    if (!email || !cryptoSymbol || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a new alert
    const newAlert = {
      id: Math.random().toString(36).substring(2, 9), // Generate a random ID
      email,
      cryptoSymbol,
      cryptoName,
      currentPrice, // Add the current price to the alert
      price, // Keep the price as a string
      alertType,
      frequency,
      createdAt: new Date().toISOString(),
      active: true
    };
    
    // Add to our in-memory store (in a real app, save to database)
    priceAlerts.push(newAlert);
    
    // In a real application, you would set up an email sending service
    // like SendGrid, Mailgun, or AWS SES to send the emails
    
    // For example, with SendGrid:
    // 
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to: data.email,
    //   from: 'alerts@cryptovault.example.com',
    //   subject: `Price Alert Set: ${data.cryptoSymbol}`,
    //   text: `Your price alert for ${data.cryptoName} has been set. We'll notify you when the price goes ${data.alertType} $${data.price}.`,
    //   html: `<p>Your price alert for <strong>${data.cryptoName}</strong> has been set.</p>
    //          <p>We'll notify you when the price goes <strong>${data.alertType}</strong> <strong>$${data.price}</strong>.</p>
    //          <p>Current price: <strong>${data.currentPrice}</strong></p>`,
    //   attachments: data.includeReport ? [
    //     {
    //       content: data.pdfBase64, // Base64 encoded PDF
    //       filename: `${data.cryptoSymbol}-price-alert-report.pdf`,
    //       type: 'application/pdf',
    //       disposition: 'attachment'
    //     }
    //   ] : []
    // };
    // 
    // await sgMail.send(msg);
    
    // Return success response with the created alert
    return NextResponse.json({
      message: 'Price alert created successfully',
      alert: {
        id: newAlert.id,
        email: newAlert.email,
        cryptoSymbol: newAlert.cryptoSymbol,
        price: newAlert.price,
        alertType: newAlert.alertType,
        frequency: newAlert.frequency,
        createdAt: newAlert.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    );
  }
}

// For demonstration purposes, let's also add a GET endpoint to retrieve alerts
// In a real app, this would be secured with authentication
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    // Filter alerts by email
    const userAlerts = priceAlerts.filter(alert => alert.email === email);
    
    // Always return an array, even if empty
    return NextResponse.json(userAlerts);
  } catch (error) {
    console.error('Error getting price alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get price alerts' },
      { status: 500 }
    );
  }
} 