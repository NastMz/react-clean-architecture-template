import { zodResolver } from '@hookform/resolvers/zod'
import { formatAppError } from '@shared/kernel/AppError'
import { Button } from '@shared/ui/atoms/Button'
import { Card, CardHeader } from '@shared/ui/atoms/Card'
import { Input } from '@shared/ui/atoms/Input'
import { Row, Stack } from '@shared/ui/atoms/Layout'
import { Alert, Eyebrow, Muted, Title } from '@shared/ui/atoms/Typography'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateProduct, useProducts } from './productHooks'

const createProductSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name is too short'),
  price: z.coerce.number().positive('Price must be greater than zero'),
})

type CreateProductForm = z.infer<typeof createProductSchema>

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const ProductsPage = () => {
  const form = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', price: 25 },
    mode: 'onSubmit',
  })

  const productsQuery = useProducts()
  const createProductMutation = useCreateProduct()

  const onSubmit = form.handleSubmit((data) => {
    createProductMutation.mutate(data, {
      onSuccess: () => {
        form.reset({ name: '', price: 25 })
      },
    })
  })

  const activeError = productsQuery.error ?? createProductMutation.error
  const products = productsQuery.data ?? []

  return (
    <Card>
      <CardHeader>
        <div>
          <Eyebrow>Products feature</Eyebrow>
          <h2>Catalog demo</h2>
          <Muted>
            Second vertical slice with its own repository, use cases, adapters, and route.
          </Muted>
        </div>
      </CardHeader>

      {activeError ? <Alert>{formatAppError(activeError)}</Alert> : null}

      <form
        onSubmit={(event) => {
          void onSubmit(event)
        }}
      >
        <Stack>
          <label>
            <span>Name</span>
            <Input type="text" {...form.register('name')} required />
            {form.formState.errors.name ? (
              <Muted>{form.formState.errors.name.message}</Muted>
            ) : null}
          </label>
          <label>
            <span>Price</span>
            <Input type="number" min="1" step="1" {...form.register('price')} required />
            {form.formState.errors.price ? (
              <Muted>{form.formState.errors.price.message}</Muted>
            ) : null}
          </label>
          <Row>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? 'Saving…' : 'Add product'}
            </Button>
            <Muted>Protected route backed by in-memory feature state.</Muted>
          </Row>
        </Stack>
      </form>

      <Stack>
        <Title>Catalog</Title>
        {productsQuery.isLoading ? <Muted>Loading products…</Muted> : null}
        {!productsQuery.isLoading && products.length === 0 ? (
          <Muted>No products yet. Add the first one to prove the flow.</Muted>
        ) : null}
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong> - {currency.format(product.price)}
            </li>
          ))}
        </ul>
      </Stack>
    </Card>
  )
}
