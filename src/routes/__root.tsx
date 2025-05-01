import { Notifications } from '@mantine/notifications'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import PersistStorage from '../components/PersistStorage/PersistStorage'

export const Route = createRootRoute({
  component: () => (
    <>
      <PersistStorage>
        <Notifications />
        <Outlet />
        <TanStackRouterDevtools />
      </PersistStorage>
    </>
  ),
})
