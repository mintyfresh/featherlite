import { Notifications } from '@mantine/notifications'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import AudioProvider from '../components/AudioProvider/AudioProvider'
import PersistStorage from '../components/PersistStorage/PersistStorage'

export const Route = createRootRoute({
  component: () => (
    <AudioProvider>
      <PersistStorage>
        <Notifications />
        <Outlet />
        <TanStackRouterDevtools />
      </PersistStorage>
    </AudioProvider>
  ),
})
