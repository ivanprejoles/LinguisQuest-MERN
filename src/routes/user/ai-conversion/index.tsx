import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/ai-conversion/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/ai-conversion/"!</div>
}
