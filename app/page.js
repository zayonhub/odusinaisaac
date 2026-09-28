import CmsPage from '../components/CmsPage';
import { getMediaMap, getPublishedPage, getPublishedProjects } from '../lib/cms';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getPublishedPage('home');
  return { title: page?.seo_title || 'Odusina Isaac', description: page?.seo_description || '' };
}

export default async function Home() {
  const [page, projects, mediaMap] = await Promise.all([getPublishedPage('home'), getPublishedProjects(), getMediaMap()]);
  return <CmsPage page={page} projects={projects} mediaMap={mediaMap}/>;
}
