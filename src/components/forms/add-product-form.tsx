"use client"

import * as React from "react"
import type { FullFile, UploadThingOutput, UploadThingProps } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PRODUCT_CATEGORY } from "@prisma/client"
import { generateReactHelpers } from "@uploadthing/react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useZact } from "zact/client"
import { type z } from "zod"

import { addProductAction } from "@/lib/actions"
import { addProductSchema } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileDialog } from "@/components/file-dialog"
import { Icons } from "@/components/icons"
import { SelectInput } from "@/components/select-input"
import type { OurFileRouter } from "@/app/api/uploadthing/core"

interface AddProductFormProps {
  storeId: string
}

type Inputs = z.infer<typeof addProductSchema>

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

export function AddProductForm({ storeId }: AddProductFormProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<FullFile[] | null>(
    null
  )
  const [isLoading, setIsLoading] = React.useState(false)

  // zact
  const addProductMuation = useZact(addProductAction)

  // uploadthing
  const uploadThingProps = useUploadThing(
    "productImage"
  ) satisfies UploadThingProps

  // react-hook-form
  const { register, handleSubmit, formState, control, reset } = useForm<Inputs>(
    {
      resolver: zodResolver(addProductSchema),
    }
  )

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data)

    setIsLoading(true)

    const rawImages = selectedFiles?.length
      ? ((await uploadThingProps.startUpload()) as UploadThingOutput[])
      : []

    selectedFiles?.length &&
      (await toast.promise(uploadThingProps.startUpload(), {
        loading: "Uploading images...",
        success: "Images uploaded successfully.",
        error: "Failed to upload images.",
      }))

    const images = selectedFiles?.length
      ? rawImages.map((image) => ({
          id: image.fileKey,
          name: image.fileKey,
          url: image.fileUrl,
        }))
      : []

    setIsLoading(addProductMuation.isLoading)
    await addProductMuation.mutate({
      storeId,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      quantity: data.quantity,
      inventory: data.inventory,
      images: images,
    })

    addProductMuation.error
      ? toast.error(addProductMuation.error.message)
      : toast.success("Product added successfully")
    setIsLoading(false)
    reset()
  }

  return (
    <form
      className="mx-auto grid w-full max-w-xl gap-6"
      onSubmit={(...args) => void handleSubmit(onSubmit)(...args)}
    >
      <fieldset className="grid gap-2.5">
        <Label htmlFor="add-product-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="add-product-name"
          type="text"
          placeholder="Type product name here."
          {...register("name", { required: true })}
        />
        {formState.errors.name && (
          <p className="text-sm text-red-500">
            {formState.errors.name.message}
          </p>
        )}
      </fieldset>
      <fieldset className="grid gap-2.5">
        <Label htmlFor="add-product-description">Description</Label>
        <Textarea
          id="add-product-description"
          placeholder="Type product description here."
          {...register("description")}
        />
        {formState.errors.description && (
          <p className="text-sm text-red-500">
            {formState.errors.description.message}
          </p>
        )}
      </fieldset>
      <div className="flex flex-col items-start  gap-2.5 sm:flex-row">
        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="add-product-category">
            Category <span className="text-red-500">*</span>
          </Label>
          <SelectInput
            control={control}
            name="category"
            placeholder="Select a category."
            options={Object.values(PRODUCT_CATEGORY)}
          />
          {formState.errors.category && (
            <p className="text-sm text-red-500">
              {formState.errors.category.message}
            </p>
          )}
        </fieldset>
        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="add-product-price">
            Price <span className="text-red-500">*</span>
          </Label>
          <Input
            id="add-product-price"
            type="number"
            placeholder="Type product price here."
            {...register("price", { required: true, valueAsNumber: true })}
          />
          {formState.errors.price && (
            <p className="text-sm text-red-500">
              {formState.errors.price.message}
            </p>
          )}
        </fieldset>
      </div>
      <div className="flex flex-col items-start gap-2.5 sm:flex-row">
        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="add-product-quantity">
            Quantity <span className="text-red-500">*</span>
          </Label>
          <Input
            id="add-product-quantity"
            type="number"
            placeholder="Type product quantity here."
            {...register("quantity", { required: true, valueAsNumber: true })}
          />
          {formState.errors.quantity && (
            <p className="text-sm text-red-500">
              {formState.errors.quantity.message}
            </p>
          )}
        </fieldset>
        <fieldset className="grid w-full gap-2.5">
          <Label htmlFor="add-product-inventory">
            Inventory <span className="text-red-500">*</span>
          </Label>
          <Input
            id="add-product-inventory"
            type="number"
            placeholder="Type product inventory here."
            {...register("inventory", { required: true, valueAsNumber: true })}
          />
          {formState.errors.inventory && (
            <p className="text-sm text-red-500">
              {formState.errors.inventory.message}
            </p>
          )}
        </fieldset>
      </div>
      <fieldset className="grid gap-3">
        <Label htmlFor="add-product-images">Images</Label>
        <FileDialog
          uploadThingProps={uploadThingProps}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          maxFiles={3}
          maxSize={1024 * 1024 * 4}
          disabled={isLoading}
        />
      </fieldset>
      <Button disabled={isLoading}>
        {isLoading && (
          <Icons.spinner
            className="mr-2 h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        Add Product
        <span className="sr-only">Add Product</span>
      </Button>
    </form>
  )
}
