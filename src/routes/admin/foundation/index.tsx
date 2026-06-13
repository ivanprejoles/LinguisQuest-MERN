import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/foundation/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/foundation/"!</div>
}
