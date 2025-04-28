import { Alert, Text, MantineColor } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { FormErrors } from '../../hooks/use-form-errors'
import { useMemo } from 'react'

export interface FormBaseErrorsProps {
  colour?: MantineColor
  icon?: React.ReactNode
  title?: string
  errors: FormErrors
  except?: (string | null)[] | string | null
}

export default function FormBaseErrors({
  colour = 'red',
  icon = <IconAlertCircle />,
  title,
  errors,
  except = [],
}: FormBaseErrorsProps) {
  const messages = useMemo(() => Array.from(new Set(errors.except(except))), [errors, except])

  if (messages.length === 0) {
    return null
  }

  return (
    <Alert color={colour} icon={icon} title={title}>
      {messages.map((message) => (
        <Text key={message}>{message}</Text>
      ))}
    </Alert>
  )
}
