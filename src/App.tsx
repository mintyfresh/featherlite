import { createTheme, MantineProvider } from '@mantine/core'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { EventsList } from './components/EventsList'
import { EventDetails } from './components/event/EventDetails'
import MatchSlips from './components/round/MatchSlips'

const theme = createTheme({})

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/:id/:tab" element={<EventDetails />} />
          <Route path="/rounds/:id/slips" element={<MatchSlips />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MantineProvider>
  )
}
