import express from 'express';
import { getModels } from '../lib/models';
import { logger } from '../lib/logger';

const router = express.Router();

/** Google limit: 50,000 URLs per sitemap. Use 45,000 to stay safe. */
const MAX_LIMIT = 45000;

/**
 * GET /api/sitemap/businesses
 * Paginated list of approved businesses for sitemap (slug + updatedAt only).
 * Used by Next.js sitemap routes; does not load full documents.
 */
router.get('/businesses', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit as string) || MAX_LIMIT));
    const skip = (page - 1) * limit;

    const models = await getModels();
    const filter = {
      status: 'approved',
      slug: { $exists: true, $ne: '', $type: 'string' }
    };

    const [total, businesses] = await Promise.all([
      models.businesses.countDocuments(filter),
      models.businesses
        .find(filter, {
          projection: { slug: 1, updatedAt: 1, createdAt: 1 },
          sort: { _id: 1 }
        })
        .skip(skip)
        .limit(limit)
        .toArray()
    ]);

    const list = (businesses as Array<{ slug?: string; updatedAt?: Date; createdAt?: Date }>)
      .filter(b => b.slug && String(b.slug).trim())
      .map(b => ({
        slug: String(b.slug).trim(),
        updatedAt: b.updatedAt || b.createdAt || new Date()
      }));

    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json({
      ok: true,
      total,
      page,
      limit,
      businesses: list
    });
  } catch (err: any) {
    logger.error('Sitemap API businesses:', err);
    res.status(500).json({ ok: false, error: err?.message || 'Failed to fetch sitemap businesses' });
  }
});

export default router;
