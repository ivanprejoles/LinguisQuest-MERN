import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/scenarios/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/scenarios/"!</div>
}
