/**
 * Invalidate Cache API Endpoint
 * POST /api/admin/cache/invalidate
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { clearCache, invalidateCache } from '@/utils/apiCache';
import { validateBody } from '@/utils/apiValidation';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

// Schema for cache invalidation
const CacheInvalidationSchema = z.object({
  tags: z.array(z.string()).optional(),
  clearAll: z.boolean().optional().default(false)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin status (assuming you have an admin_users table)
  const { data: isAdmin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (!isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Validate request body
  const validatedBody = validateBody(req, res, CacheInvalidationSchema);
  if (!validatedBody) return;

  const { tags, clearAll } = validatedBody;

  try {
    if (clearAll) {
      // Clear the entire cache
      clearCache();
      return res.status(200).json({ success: true, message: 'Cache cleared successfully' });
    } else if (tags && tags.length > 0) {
      // Invalidate specific tags
      invalidateCache(tags);
      return res.status(200).json({ 
        success: true, 
        message: `Cache invalidated for tags: ${tags.join(', ')}` 
      });
    } else {
      return res.status(400).json({ 
        error: 'Either tags array or clearAll flag must be provided' 
      });
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
