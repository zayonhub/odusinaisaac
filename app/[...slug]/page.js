import { notFound } from 'next/navigation';
import CmsPage from '../../components/CmsPage';
import { getMediaMap, getPublishedPage, getPublishedProject, getPublishedProjects } from '../../lib/cms';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  if (slug[0] === 'projects' && slug[1]) {
    const project = await getPublishedProject(slug[1]);
    return { title: project?.seo_title || project?.title || 'Project', description: project?.seo_description || project?.summary || '' };
  }
  const page = await getPublishedPage(slug.join('/'));
  return { title: page?.seo_title || page?.title || 'Odusina Isaac', description: page?.seo_description || '' };
}

export default async function DynamicPage({ params }) {
  const { slug = [] } = await params;
  const mediaMap = await getMediaMap();
  if (slug[0] === 'projects' && slug[1]) {
    const [project, projects] = await Promise.all([getPublishedProject(slug[1]), getPublishedProjects()]);
    if (!project) notFound();
    return <CmsPage project={project} page={project.page ? { ...project.page, sections: project.sections } : null} projects={projects} mediaMap={mediaMap}/>;
  }
  const [page, projects] = await Promise.all([getPublishedPage(slug.join('/')), getPublishedProjects()]);
  if (!page) notFound();
  return <CmsPage page={page} projects={projects} mediaMap={mediaMap}/>;
}
