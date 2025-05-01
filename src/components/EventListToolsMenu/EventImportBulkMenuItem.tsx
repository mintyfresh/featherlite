import { MenuItem, MenuItemProps } from '@mantine/core'
import { useFileDialog } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import eventImportBulk from '../../db/event/event-import-bulk'
import { useState } from 'react'

export type EventImportBulkMenuItemProps = Omit<MenuItemProps, 'onClick' | 'disabled'>

export default function EventImportBulkMenuItem({ ...props }: EventImportBulkMenuItemProps) {
  const [loading, setLoading] = useState(false)

  const { open } = useFileDialog({
    multiple: false,
    accept: '.json',
    onChange(files) {
      if (files?.length === 1 && files[0]) {
        setLoading(true)
        importEvents(files[0]).finally(() => setLoading(false))
      }
    },
  })

  return (
    <MenuItem onClick={open} disabled={loading} {...props}>
      Import Events
    </MenuItem>
  )
}

async function importEvents(file: File) {
  try {
    const text = await file.text()
    const input = JSON.parse(text)

    await eventImportBulk(input)
  } catch (error) {
    notifications.show({
      title: 'Import Failed',
      message: `Failed to import: ${error instanceof Error ? error.message : error}`,
      color: 'red',
      autoClose: 3000,
    })
  }
}
