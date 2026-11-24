import { useParams } from 'react-router'
import { ProductEditorPage } from '../features/products/components/product-editor-page'

export function AdminProductEditorRoute() {
  const { id } = useParams<{ id: string }>()
  return <ProductEditorPage productId={id === 'new' ? undefined : id} />
}

