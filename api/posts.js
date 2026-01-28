/**
 * Vercel Serverless Function: GET /api/posts
 * 
 * Retrieves posts from Airtable for verification.
 * Supports two modes:
 *   - ?id=recXXX - Get a specific post by Airtable record ID
 *   - ?workshop=X - Get recent posts filtered by workshop name
 * 
 * Requires WorkshopKey query param for authorization.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  // Validate WorkshopKey from query param
  const { id, workshop, WorkshopKey } = req.query;

  if (!WorkshopKey || WorkshopKey !== process.env.WORKSHOP_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid or missing WorkshopKey' });
  }

  // Must provide either id or workshop
  if (!id && !workshop) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required parameter. Provide either "id" or "workshop" query parameter.' 
    });
  }

  try {
    // Mode 1: Get specific post by ID
    if (id) {
      const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Posts/${id}`;
      
      const response = await fetch(airtableUrl, {
        method: 'GET',
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
          error: 'Failed to fetch from Airtable'
        });
      }

      const record = await response.json();
      
      return res.status(200).json({
        success: true,
        post: {
          id: record.id,
          name: record.fields.Name,
          message: record.fields.Message,
          workshop: record.fields.Workshop,
          tags: record.fields.Tags || [],
          createdAt: record.createdTime
        }
      });
    }

    // Mode 2: Get recent posts by workshop
    if (workshop) {
      // Build Airtable filter formula
      const filterFormula = `{Workshop} = "${workshop.replace(/"/g, '\\"')}"`;
      const params = new URLSearchParams({
        filterByFormula: filterFormula,
        maxRecords: '50',
        sort: JSON.stringify([{ field: 'Created', direction: 'desc' }])
      });
      
      // Note: Airtable uses 'sort[0][field]' and 'sort[0][direction]' format
      const airtableUrl = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Posts?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=50`;
      
      const response = await fetch(airtableUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Airtable error:', errorText);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch from Airtable'
        });
      }

      const data = await response.json();
      
      const posts = data.records.map(record => ({
        id: record.id,
        name: record.fields.Name,
        message: record.fields.Message,
        workshop: record.fields.Workshop,
        tags: record.fields.Tags || [],
        createdAt: record.createdTime
      }));

      return res.status(200).json({
        success: true,
        count: posts.length,
        workshop: workshop,
        posts: posts
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
