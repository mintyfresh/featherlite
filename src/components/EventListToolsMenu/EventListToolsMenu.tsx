import { Button, Menu } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { Event } from '../../db'
import EventExportBulkMenuItem from './EventExportBulkMenuItem'
import EventImportBulkMenuItem from './EventImportBulkMenuItem'
import PreloadPythonContextMenuItem from './PreloadPythonContextMenuItem'

export interface EventListToolsMenuProps {
  events: Event[]
}

export default function EventListToolsMenu({ events }: EventListToolsMenuProps) {
  return (
    <Menu shadow="md">
      <Menu.Target>
        <Button variant="outline" color="gray" rightSection={<IconChevronDown size={16} />}>
          Tools
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Offline Mode</Menu.Label>
        <PreloadPythonContextMenuItem />
        <Menu.Divider />
        <Menu.Label>Data</Menu.Label>
        <EventExportBulkMenuItem events={events} />
        <EventImportBulkMenuItem />
      </Menu.Dropdown>
    </Menu>
  )
}
