import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/lib/test/utils"
import { Button } from "../button"
import userEvent from "@testing-library/user-event"

describe("Button", () => {
  it("deve renderizar corretamente", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it("deve aplicar variante default por padrão", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-primary")
  })

  it("deve aplicar variante destructive", () => {
    render(<Button variant="destructive">Delete</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("deve aplicar variante outline", () => {
    render(<Button variant="outline">Outline</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("border")
  })

  it("deve aplicar tamanho sm", () => {
    render(<Button size="sm">Small</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("h-9")
  })

  it("deve aplicar tamanho lg", () => {
    render(<Button size="lg">Large</Button>)

    const button = screen.getByRole("button")
    expect(button).toHaveClass("h-11")
  })

  it("deve executar onClick quando clicado", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole("button")
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("deve estar desabilitado quando disabled=true", () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("não deve executar onClick quando desabilitado", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )

    const button = screen.getByRole("button")
    await user.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})
