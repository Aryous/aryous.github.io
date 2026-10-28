import type { APIContext } from 'astro';
import { writingFeed } from '../lib/feed';

export const GET = (context: APIContext) => writingFeed(context, 'zh');
