'use strict';

/**
 * Enable GA4 only when a valid measurement ID is supplied at build time.
 * This keeps environment-specific analytics settings out of the repository.
 */
hexo.extend.filter.register('before_generate', () => {
  const measurementId = (process.env.GA_MEASUREMENT_ID || '').trim();

  if (!measurementId) {
    return;
  }

  if (!/^G-[A-Z0-9]+$/.test(measurementId)) {
    throw new Error(
      'GA_MEASUREMENT_ID must be a GA4 measurement ID such as G-XXXXXXXXXX'
    );
  }

  const analytics = hexo.theme.config.web_analytics;
  analytics.enable = true;
  analytics.google = analytics.google || {};
  analytics.google.measurement_id = measurementId;

  hexo.log.info('GA4 visitor analytics enabled');
});
