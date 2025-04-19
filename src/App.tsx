import { createTheme, MantineProvider } from '@mantine/core'
import { EventsList } from './components/EventsList'

const theme = createTheme({
})

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <EventsList />
    </MantineProvider>
  )
}
