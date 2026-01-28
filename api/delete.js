/**
 * Vercel Serverless Function: DELETE /api/delete
 * 
 * Deletes a post from Airtable by record ID.
 * Requires AdminKey for authorization (not for student use).
 * Used by CI tests to clean up after themselves.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use DELETE.' });
  }

  // Validate AdminKey from query param
  const { id, AdminKey } = req.query;

  if (!AdminKey || AdminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing AdminKey' });
  }

  // Validate id
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing required parameter: id' });
  }

  try {
    const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Posts/${id}`;
    
    const response = await fetch(airtableUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
      }
    });

    if (response.status === 404) {
      return res.status(404).json({ 
        success: false, 
        error: 'Post not found',
        id: id
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable error:', errorText);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete from Airtable'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted',
      id: id
    });

  } catch (err) {
    console.error('Request error:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      details: err.message
    });
  }
}
