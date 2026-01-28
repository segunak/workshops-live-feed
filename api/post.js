/**
 * Vercel Serverless Function: POST /api/post
 * 
 * Accepts workshop posts from students and writes to Airtable.
 * Validates WorkshopKey before allowing writes.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // Parse body
  const { Name, Message, Workshop, Tags, WorkshopKey } = req.body;

  // Validate WorkshopKey
  if (!WorkshopKey || WorkshopKey !== process.env.WORKSHOP_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing WorkshopKey' });
  }

  // Validate required fields
  if (!Name || !Name.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' });
  }
  if (!Message || !Message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }
  if (!Workshop || !Workshop.trim()) {
    return res.status(400).json({ success: false, error: 'Workshop is required' });
  }

  // Build Airtable record
  const fields = {
    Name: Name.trim(),
    Message: Message.trim(),
    Workshop: Workshop.trim()
  };

  // Tags is optional - convert comma-separated string to array for Airtable multi-select
  if (Tags && Tags.trim()) {
    // Split by comma, trim each tag, filter empty strings
    const tagsArray = Tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    if (tagsArray.length > 0) {
      fields.Tags = tagsArray;
    }
  }

  // Write to Airtable
  try {
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Posts`;
    
    const response = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
    });

    if (response.ok) {
      const record = await response.json();
      return res.status(200).json({
        success: true,
        message: 'Posted successfully!',
        id: record.id
      });
    } else {
      const errorText = await response.text();
      console.error('Airtable error:', errorText);
      return res.status(500).json({
        success: false,
        error: 'Failed to write to Airtable',
        details: errorText
      });
    }
  } catch (err) {
    console.error('Request error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
}
