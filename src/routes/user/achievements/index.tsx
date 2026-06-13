import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/achievements/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/achievements/"!</div>
}
