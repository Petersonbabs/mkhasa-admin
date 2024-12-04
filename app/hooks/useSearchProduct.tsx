'use client'

import { Product } from "../contexts/ProductsContext"

const useSearchProduct = (data: Product[], query: string) => {
  const results: Product[] = data.filter((product: Product) => product.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  return results
}

export default useSearchProduct
