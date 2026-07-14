import { useEffect, useState } from "react";

const emptyForm = {
  name: "",
  slug: "",
  sku: "",
  category_name: "",
  brand_name: "",
  description: "",

  price: "",
  original_price: "",
  badge: "",

  stock_quantity: "",

  is_active: true,

  images: [],
  variants: []
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProductFormModal({

  open,
  onClose,
  onSave,

  initialData = null,

  categories = [],
  brands = [],

  saving = false

}) {

  const [form, setForm] = useState(emptyForm);

  const [slugTouched, setSlugTouched] = useState(false);

  const [showVariantForm, setShowVariantForm] = useState(false);

  const [variantForm, setVariantForm] = useState({
      size: "",
      color: "",
      stock_quantity: "",
      price: ""
  });

  useEffect(() => {

    if (!open) return;

    if (initialData) {

      setForm({

        name: initialData.name || "",
        slug: initialData.slug || "",
        sku: initialData.sku || "",

        category_name:
          initialData.category_name || "",

        brand_name:
          initialData.brand_name || "",

        description:
          initialData.description || "",

        price:
          initialData.price || "",

        original_price:
          initialData.original_price || "",

        badge:
          initialData.badge || "",

        stock_quantity:
          initialData.stock_quantity || "",

        is_active: Boolean(Number(initialData.is_active)),

        images:
          initialData.images || [],

        variants:
          initialData.variants || []

      });

      setSlugTouched(true);

    }

    else {

      setForm(emptyForm);

      setSlugTouched(false);

    }

  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {

    e.preventDefault();

    onSave(form);

  };

  return (

    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">

      <form className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col">

        {/* Header */}

        <div className="flex items-center justify-between px-8 py-6 border-b bg-white rounded-t-3xl">

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              {initialData ? "Edit Product" : "Add Product"}

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              Manage your product details, gallery and variants.

            </p>

          </div>

          <button

            onClick={onClose}

            disabled={saving}

            className="w-10 h-10 rounded-xl hover:bg-gray-100 transition"

          >

            ✕

          </button>

        </div>

        {/* Scrollable Body */}

        <form

          onSubmit={handleSubmit}

          className="flex-1 overflow-y-auto px-8 py-8 space-y-10"

        >

          {/* ================================================= */}

          {/* GENERAL INFORMATION */}

          {/* ================================================= */}

          <div>

            <h3 className="text-lg font-bold text-gray-800 mb-6">

              General Information

            </h3>

            <div className="grid grid-cols-2 gap-6">

              {/* Product Name */}

              <div className="col-span-2">

                <label className="text-sm font-semibold text-gray-700">

                  Product Name

                </label>

                <input

                  type="text"

                  required

                  value={form.name}

                  disabled={saving}

                  onChange={(e) => {

                    const value = e.target.value;

                    setForm(prev => ({

                      ...prev,

                      name: value,

                      slug: slugTouched

                        ? prev.slug

                        : slugify(value)

                    }));

                  }}

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 outline-none"

                />

              </div>

              {/* Slug */}

              <div>

                <label className="text-sm font-semibold">

                  Slug

                </label>

                <input

                  value={form.slug}

                  onChange={(e) => {

                    setSlugTouched(true);

                    setForm({

                      ...form,

                      slug: e.target.value

                    });

                  }}

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                />

              </div>

              {/* SKU */}

              <div>

                <label className="text-sm font-semibold">

                  SKU

                </label>

                <input

                  value={form.sku}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      sku: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                />

              </div>

              {/* Category */}

              <div>

                <label className="text-sm font-semibold">

                  Category

                </label>

                <select

                  value={form.category_name}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      category_name: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                >

                  <option value="">

                    Select Category

                  </option>

                  {categories.map(category => (

                    <option

                      key={category.category_id}

                      value={category.name}

                    >

                      {category.name}

                    </option>

                  ))}

                </select>

              </div>

              {/* Brand */}

              <div>

                <label className="text-sm font-semibold">

                  Brand

                </label>

                <select

                  value={form.brand_name}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      brand_name: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                >

                  <option value="">

                    Select Brand

                  </option>

                  {brands.map(brand => (

                    <option

                      key={brand.brand_id}

                      value={brand.name}

                    >

                      {brand.name}

                    </option>

                  ))}

                </select>

              </div>

              {/* Description */}

              <div className="col-span-2">

                <label className="text-sm font-semibold">

                  Description

                </label>

                <textarea

                  rows={5}

                  value={form.description}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      description: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 resize-none"

                />

              </div>

            </div>

          </div>

          {/* ================================================= */}

          {/* PRICING */}

          {/* ================================================= */}

          <div>

            <h3 className="text-lg font-bold text-gray-800 mb-6">

              Pricing

            </h3>

            <div className="grid grid-cols-3 gap-6">

              <div>

                <label className="text-sm font-semibold">

                  Price

                </label>

                <input

                  type="number"

                  value={form.price}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      price: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                />

              </div>

              <div>

                <label className="text-sm font-semibold">

                  Original Price

                </label>

                <input

                  type="number"

                  value={form.original_price}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      original_price: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                />

              </div>

              <div>

                <label className="text-sm font-semibold">

                  Badge

                </label>

                <select

                  value={form.badge}

                  onChange={(e) =>

                    setForm({

                      ...form,

                      badge: e.target.value

                    })

                  }

                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"

                >

                  <option value="">

                    None

                  </option>

                  <option value="New">

                    New

                  </option>

                  <option value="Sale">

                    Sale

                  </option>

                  <option value="Hot">

                    Hot

                  </option>

                </select>

              </div>

            </div>

          </div>
          {/* ================================================= */}
          {/* INVENTORY */}
          {/* ================================================= */}

          <div>

            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Inventory
            </h3>

            <div className="grid grid-cols-2 gap-6">

              <div>

                <label className="text-sm font-semibold text-gray-700">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.stock_quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock_quantity: e.target.value
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />

              </div>

              {initialData && (

                <div>

                  <label className="text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    value={form.is_active ? "true" : "false"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.value === "true"
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  >

                    <option value="true">
                      Active
                    </option>

                    <option value="false">
                      Inactive
                    </option>

                  </select>

                </div>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* PRODUCT IMAGES */}
          {/* ================================================= */}

          <div>

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-lg font-bold text-gray-800">
                Product Images
              </h3>

              <div>
                <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {

                        const files = Array.from(e.target.files);

                        const newImages = files.map((file) => ({

                            file,

                            image_url: URL.createObjectURL(file),

                            is_primary: form.images.length === 0

                        }));

                        setForm({

                            ...form,

                            images: [

                                ...form.images,

                                ...newImages

                            ]

                        });

                    }}
                />

                <label
                    htmlFor="product-images"
                    className="cursor-pointer rounded-xl bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600"
                >
                    + Add Images
                </label>

            </div>

            </div>

            {form.images.length === 0 ? (

              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center">

                <div className="text-5xl mb-3">
                  🖼️
                </div>

                <p className="font-semibold text-gray-600">
                  No Images Added
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Upload product images.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-4 gap-5">

                {form.images.map((image, index) => (

                  <div
                    key={index}
                    className="rounded-2xl border bg-white overflow-hidden shadow-sm"
                  >

                    <img
                      src={image.image_url}
                      alt=""
                      className="h-44 w-full object-cover"
                    />

                    <div className="p-3">

                        {image.is_primary && (

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Primary
                          </span>

                        )}

                      <button
                          type="button"
                          onClick={() => {

                              const updated = form.images.filter((_, i) => i !== index);

                              if (
                                  updated.length &&
                                  !updated.some(img => img.is_primary)
                              ) {
                                  updated[0].is_primary = true;
                              }

                              setForm({

                                  ...form,

                                  images: updated

                              });

                          }}
                          className="..."
                          >
                          Remove
                      </button>

                      {!image.is_primary && (
                        <button
                        type="button"
                        onClick={() => {

                            const updated = form.images.map((img, i) => ({

                                ...img,

                                is_primary: i === index

                            }));

                            setForm({

                                ...form,

                                images: updated

                            });

                        }}
                        className="mt-2 w-full rounded-lg border border-green-300 py-2 text-green-600 hover:bg-green-50"
                        >

                        Make Primary

                        </button>
                        )}
                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* ================================================= */}
          {/* PRODUCT VARIANTS */}
          {/* ================================================= */}

          <div>

            <div className="flex items-center justify-between mb-6">

              <h3 className="text-lg font-bold text-gray-800">
                Product Variants
              </h3>

              <button
                type="button"
                onClick={() => setShowVariantForm(true)}
                className="rounded-xl bg-pink-500 px-5 py-2 text-white"
                >
                + Add Variant
              </button>

            </div>

            {form.variants.length === 0 ? (

              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center">

                <div className="text-5xl mb-3">
                  📦
                </div>

                <p className="font-semibold text-gray-600">
                  No Variants Added
                </p>

              </div>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-gray-200">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Size
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Color
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Price
                      </th>

                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">Actions</th>

                    </tr>

                  </thead>

                  <tbody>

                      {form.variants.map((variant, index) => (

                        <tr
                          key={index}
                          className="border-t"
                        >

                          <td className="px-5 py-4">
                            {variant.size}
                          </td>

                          <td className="px-5 py-4">
                            {variant.color}
                          </td>

                          <td className="px-5 py-4">
                            {variant.stock_quantity}
                          </td>

                          <td className="px-5 py-4">
                            ₹{variant.price}
                          </td>

                          <td className="px-5 py-4">

                            <button
                              type="button"
                              onClick={() => {

                                setForm({

                                  ...form,

                                  variants: form.variants.filter(
                                    (_, i) => i !== index
                                  )

                                });

                              }}
                              className="text-red-500 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                </table>

                {showVariantForm && (

                  <div className="mt-6 rounded-2xl border p-6 bg-gray-50">

                  <div className="grid grid-cols-4 gap-4">

                  <input
                      placeholder="Size"
                      value={variantForm.size}
                      onChange={(e)=>
                      setVariantForm({
                      ...variantForm,
                      size:e.target.value
                      })
                      }
                      className="rounded-xl border px-4 py-3"
                  />

                  <input
                      placeholder="Color"
                      value={variantForm.color}
                      onChange={(e)=>
                      setVariantForm({
                      ...variantForm,
                      color:e.target.value
                      })
                      }
                      className="rounded-xl border px-4 py-3"
                  />

                  <input
                      type="number"
                      placeholder="Stock"
                      value={variantForm.stock_quantity}
                      onChange={(e)=>
                      setVariantForm({
                      ...variantForm,
                      stock_quantity:e.target.value
                      })
                      }
                      className="rounded-xl border px-4 py-3"
                  />

                  <input
                      type="number"
                      placeholder="Price"
                      value={variantForm.price}
                      onChange={(e)=>
                      setVariantForm({
                      ...variantForm,
                      price:e.target.value
                      })
                      }
                      className="rounded-xl border px-4 py-3"
                  />

                  </div>

                  <div className="flex justify-end gap-3 mt-6">

                  <button
                      type="button"
                      onClick={()=>{
                      setShowVariantForm(false);

                      setVariantForm({

                      size:"",
                      color:"",
                      stock_quantity:"",
                      price:""

                      });

                      }}
                      className="px-5 py-2 rounded-xl border"
                  >

                  Cancel

                  </button>

                  <button
                      type="button"
                      onClick={()=>{

                      setForm({

                      ...form,

                      variants:[

                      ...form.variants,

                      variantForm

                      ]

                      });

                      setVariantForm({

                      size:"",
                      color:"",
                      stock_quantity:"",
                      price:""

                      });

                      setShowVariantForm(false);

                      }}
                      className="px-6 py-2 rounded-xl bg-pink-500 text-white"
                      >

                    Save Variant

                  </button>

                  </div>

                </div>

              )}

            </div>

          )}

          </div>
          {/* ================================================= */}
          {/* PRODUCT INFORMATION (Only While Editing) */}
          {/* ================================================= */}

          {initialData && (

            <div>

              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Product Information
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Product ID
                  </p>

                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    #{initialData.product_id}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    SKU
                  </p>

                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    {form.sku}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Rating
                  </p>

                  <p className="mt-2 text-lg font-semibold text-yellow-500">
                    ⭐ {initialData.average_rating || "0.00"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reviews
                  </p>

                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    {initialData.review_count || 0}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Created At
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {initialData.created_at
                      ? new Date(initialData.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Updated At
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {initialData.updated_at
                      ? new Date(initialData.updated_at).toLocaleString()
                      : "-"}
                  </p>
                </div>

              </div>

            </div>

          )}

        </form>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="border-t bg-white px-8 py-5 rounded-b-3xl">

          <div className="flex justify-center gap-4">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-w-[180px] rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={undefined}
              onClick={handleSubmit}
              disabled={saving}
              className="min-w-[220px] rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 transition flex items-center justify-center gap-3"
            >

              {saving && (

                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

              )}

              {saving
                ? "Saving..."
                : initialData
                  ? "Save Changes"
                  : "Create Product"}

            </button>

          </div>

        </div>

      </form>

    </div>

   )

};