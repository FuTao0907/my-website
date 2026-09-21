import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export function isPublicProject(p: Project): boolean {
  if (import.meta.env.DEV) return true;
  return !p.data.draft;
}

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all
    .filter(isPublicProject)
    .sort((a, b) => b.data.startDate.valueOf() - a.data.startDate.valueOf());
}

export const projectStatusLabel: Record<Project['data']['status'], string> = {
  active: '进行中',
  completed: '已完结',
  archived: '归档',
};

export function formatDate(d: Date): string {
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}
