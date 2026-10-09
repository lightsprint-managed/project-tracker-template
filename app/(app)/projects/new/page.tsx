import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectForm } from '@/components/project-form';
import { getMemberOptions } from '@/lib/queries';
import { createProject } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const members = await getMemberOptions();
  return (
    <div className="max-w-2xl">
      <PageHeader title="New project" description="Give it an owner and a deadline." />
      <Card>
        <CardContent className="pt-6">
          <ProjectForm action={createProject} members={members} cancelHref="/projects" submitLabel="Create project" />
        </CardContent>
      </Card>
    </div>
  );
}
