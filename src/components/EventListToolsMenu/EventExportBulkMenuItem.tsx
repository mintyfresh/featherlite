import { MenuItem, MenuItemProps } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useCallback, useState } from 'react'
import { Event } from '../../db'
import eventExportBulk from '../../db/event/event-export-bulk'

export interface EventExportBulkMenuItemProps extends Omit<MenuItemProps, 'onClick' | 'disabled'> {
  events: Event[]
}

export default function EventExportBulkMenuItem({ events, ...props }: EventExportBulkMenuItemProps) {
  const [exporting, setExporting] = useState(false)

  const exportEvents = useCallback(
    async (events: Event[]) => {
      setExporting(true)

      try {
        const result = await eventExportBulk(events)

        download(
          new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }),
          `Featherlite-${new Date().toISOString().split('T')[0]}.json`
        )
      } catch (error) {
        notifications.show({
          title: 'Export Failed',
          message: `Failed to export: ${error instanceof Error ? error.message : error}`,
          color: 'red',
          autoClose: 3000,
        })
      } finally {
        setExporting(false)
      }
    },
    [setExporting]
  )

  return (
    <MenuItem onClick={() => exportEvents(events)} disabled={exporting} {...props}>
      Export Events
    </MenuItem>
  )
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
