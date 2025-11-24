import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SongForm from '@/components/SongForm'

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Email Address/i), 'fan@example.com')
  await user.type(screen.getByLabelText(/Your Name/i), 'Tester')
  await user.type(screen.getByLabelText(/Song Title/i), 'Ballad of Tests')
  await user.type(screen.getByLabelText(/Song Style/i), 'Indie')
  await user.type(screen.getByLabelText(/Song Mood/i), 'Joyful')
  await user.type(
    screen.getByLabelText(/Lyrics or Theme/i),
    'This is a detailed lyrics brief that exceeds ten characters.'
  )
}

describe('SongForm', () => {
  const originalFetch = global.fetch
  const originalLocation = window.location

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()

    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL('https://songpebble.test') as unknown as Location,
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup()
    render(<SongForm />)

    await user.click(screen.getByRole('button', { name: /Create My Song/i }))

    expect(await screen.findByText(/Email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
  })

  it('submits successfully and redirects to Stripe', async () => {
    const user = userEvent.setup()
    const checkoutUrl = 'https://stripe.test/session'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl }),
    })
    global.fetch = fetchMock as unknown as typeof global.fetch

    render(<SongForm />)
    await fillForm(user)

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create My Song/i }))
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/create-order',
      expect.objectContaining({ method: 'POST' })
    )
    expect(window.location.href).toBe(checkoutUrl)
  })

  it('displays server errors returned by the API', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Unable to create order'

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: errorMessage }),
    })
    global.fetch = fetchMock as unknown as typeof global.fetch
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<SongForm />)
    await fillForm(user)

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create My Song/i }))
    })

    expect(await screen.findByText(errorMessage)).toBeInTheDocument()
  })
})
