const MILLIS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR

export function extractComponentsFromDuration(duration: number) {
  const durationInSeconds = duration / MILLIS_PER_SECOND

  return [
    Math.floor(durationInSeconds / SECONDS_PER_HOUR),
    Math.floor((durationInSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    Math.floor(durationInSeconds % SECONDS_PER_MINUTE),
  ]
}
