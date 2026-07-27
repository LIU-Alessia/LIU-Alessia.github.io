'use strict';

const path = require('path');

const OBSIDIAN_IMAGE_EMBED =
  /!\[\[([^|\]]+\.(?:avif|gif|jpe?g|png|svg|webp))(?:\|[^\]]+)?\]\]/gi;

/**
 * Convert Obsidian image embeds to standard Markdown before Hexo renders posts.
 *
 * Obsidian resolves paths from the vault root:
 *   ![[source/images/posts/example.png]]
 *
 * Hexo copies source/images to /images, so the generated Markdown must use:
 *   ![example](/images/posts/example.png)
 */
hexo.extend.filter.register('before_post_render', (data) => {
  if (!data.content || !data.content.includes('![[')) {
    return data;
  }

  data.content = data.content.replace(
    OBSIDIAN_IMAGE_EMBED,
    (embed, sourcePath) => {
      const normalizedPath = sourcePath
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\/+/, '');

      if (!normalizedPath.startsWith('source/images/')) {
        hexo.log.warn(`Skipped unsupported Obsidian image path: ${sourcePath}`);
        return embed;
      }

      const publicPath = normalizedPath.slice('source'.length);
      const extension = path.extname(normalizedPath);
      const alt = path.basename(normalizedPath, extension);

      return `![${alt}](${publicPath})`;
    }
  );
  return data;
});
