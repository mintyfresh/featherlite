import { createTheme, MantineProvider } from '@mantine/core'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { EventsList } from './components/EventsList'
import { EventDetails } from './components/EventDetails'

const theme = createTheme({
})

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  )
}
