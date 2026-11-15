import { HomePage } from '../features/home/components/home-page'
import { ProductRail } from '../features/products/components/product-rail'

export function HomeRoute() {
  return (
    <HomePage
      renderProductRail={(props) => <ProductRail {...props} />}
    />
  )
}

