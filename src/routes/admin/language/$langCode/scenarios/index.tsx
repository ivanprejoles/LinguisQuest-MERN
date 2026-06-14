import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/language/$langCode/scenarios/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/scenarios/"!</div>
}
