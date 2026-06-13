import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/foundation/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/foundation/"!</div>
}
