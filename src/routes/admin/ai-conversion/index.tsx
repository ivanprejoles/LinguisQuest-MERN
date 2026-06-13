import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/ai-conversion/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/ai-conversion/"!</div>
}
