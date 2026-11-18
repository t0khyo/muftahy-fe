import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { I18nextProvider } from "react-i18next"
import { i18n } from "@workspace/i18n/config"
import { useCartStore } from "../features/cart/stores/cart-store"
import { CartRoute } from "./cart-route"
import "../test-setup"

function renderCartRoute(initialEntry = "/en/cart") {
  const lang = initialEntry.startsWith("/ar") ? "ar" : "en"
  i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/:lang/cart" element={<CartRoute />} />
            <Route
              path="/:lang/checkout"
              element={<div>Checkout Page Destination</div>}
            />
            <Route
              path="/:lang/products"
              element={<div>Products Catalog Destination</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </I18nextProvider>
  )
}

describe("CartRoute (Shopping Cart Page)", () => {
  beforeEach(() => {
    useCartStore.getState().clear()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it("renders generous empty state with CTAs when bag has no items", () => {
    renderCartRoute("/en/cart")

    expect(
      screen.getByRole("heading", { name: /your bag is empty/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /explore products/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /browse bundles/i })
    ).toBeInTheDocument()
  })

  it("renders 2-column layout with line items and order summary sidebar when populated", () => {
    act(() => {
      useCartStore.getState().addItem({
        id: "cyberpunk:standard",
        productId: "cyberpunk",
        slug: "cyberpunk-2077",
        name: "Cyberpunk 2077",
        planName: "Standard Edition",
        priceMinor: 2999,
        currency: "USD",
        platform: "steam",
        region: "global",
      })
    })

    renderCartRoute("/en/cart")

    // Page title and line item
    expect(
      screen.getByRole("heading", { name: /shopping cart/i })
    ).toBeInTheDocument()
    expect(screen.getByText("Cyberpunk 2077")).toBeInTheDocument()
    expect(screen.getByText("(Standard Edition)")).toBeInTheDocument()

    // Order summary and Proceed to checkout
    expect(
      screen.getByRole("heading", { name: /order summary/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /proceed to checkout/i })
    ).toBeInTheDocument()

    // Test quantity stepper increment
    const plusButton = screen.getByRole("button", {
      name: /increase quantity for/i,
    })
    fireEvent.click(plusButton)
    expect(screen.getByLabelText(/quantity: 2/i)).toBeInTheDocument()

    // Test item removal
    const removeButton = screen.getByRole("button", {
      name: /remove cyberpunk 2077/i,
    })
    fireEvent.click(removeButton)
    expect(
      screen.getByRole("heading", { name: /your bag is empty/i })
    ).toBeInTheDocument()
  })

  it("renders in Arabic RTL mode with localized strings", () => {
    act(() => {
      useCartStore.getState().addItem({
        id: "windows:pro",
        productId: "windows",
        slug: "windows-11-pro",
        name: { en: "Windows 11 Pro", ar: "ويندوز 11 برو" },
        priceMinor: 4999,
        currency: "USD",
      })
    })

    renderCartRoute("/ar/cart")

    expect(document.documentElement.dir).toBe("rtl")
    expect(document.documentElement.lang).toBe("ar")

    expect(screen.getByText("ويندوز 11 برو")).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /ملخص الطلب/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /لإتمام الشراء/i })
    ).toBeInTheDocument()
  })
})
