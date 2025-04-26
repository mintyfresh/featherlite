import { createFileRoute } from '@tanstack/react-router'
import EventDetailsPage from './$eventId'

export const Route = createFileRoute('/events/$eventId/$tab')({
  component: EventDetailsPage,
})
