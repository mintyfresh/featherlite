import { Loader, MenuItem } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconAlertCircle, IconCheck, IconDownload } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { isPythonContextLoaded, preloadPythonContext } from '../../utils/swiss'

export default function PreloadPythonContextMenuItem() {
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const onClick = useCallback(async () => {
    if (!isPythonContextLoaded()) {
      const id = notifications.show({
        title: 'Loading Python runtime',
        message: 'The Python runtime is being loaded to generate pairings',
        loading: true,
        autoClose: false,
        withCloseButton: false,
      })

      setLoading(true)

      try {
        await preloadPythonContext()

        setLoaded(true)
        notifications.update({
          id,
          color: 'green',
          title: 'Python runtime loaded',
          message: 'Players can now be paired',
          icon: <IconCheck size={18} />,
          loading: false,
          autoClose: 3000,
        })
      } catch (error) {
        notifications.update({
          id,
          color: 'red',
          title: 'Python runtime loading failed',
          message: error instanceof Error ? error.message : String(error),
          icon: <IconAlertCircle size={18} />,
          loading: false,
          autoClose: 3000,
        })
      } finally {
        setLoading(false)
      }
    }
  }, [setLoaded, setLoading])

  useEffect(() => {
    setLoaded(isPythonContextLoaded())
  }, [setLoaded])

  const leftSection = loading ? <Loader size={16} /> : loaded ? <IconCheck size={16} /> : <IconDownload size={16} />
  const label = loading ? 'Loading Python Runtime...' : loaded ? 'Ready for Offline Use' : 'Preload for Offline Use'

  return (
    <MenuItem
      onClick={onClick}
      disabled={loading}
      inert={loaded}
      color={loaded ? 'gray' : undefined}
      leftSection={leftSection}
    >
      {label}
    </MenuItem>
  )
}
