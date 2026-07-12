import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

function getItemImage(item) {
  return item.image || item.img || item.thumbnail || item.images?.[0] || "";
}

function getItemName(item) {
  return item.name || item.title || "Clothing item";
}

function getItemPrice(item) {
  if (item.price !== undefined) return item.price;
  if (item.newPrice !== undefined) return item.newPrice;
  if (item.salePrice !== undefined) return item.salePrice;
  return "";
}

export default function LikedClothesPage() {
  const {
    wishlist = [],
    removeFromWishlist,
    removeWishlistItem,
    toggleWishlist,
  } = useCart();

  const removeLikedItem = (item) => {
    if (removeFromWishlist) {
      removeFromWishlist(item.id);
      return;
    }

    if (removeWishlistItem) {
      removeWishlistItem(item.id);
      return;
    }

    if (toggleWishlist) {
      toggleWishlist(item);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">Wishlist</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Liked clothes</h1>
            <p className="mt-2 text-sm text-gray-500">
              Your liked clothes from the shop page are saved here.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-md bg-pink-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-600"
          >
            Continue shopping
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.7}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">No liked clothes yet</h2>
            <p className="mt-2 text-sm text-gray-500">Click the heart button on a shop item to save it here.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => {
              const image = getItemImage(item);
              const name = getItemName(item);
              const price = getItemPrice(item);

              return (
                <article key={item.id} className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                  <Link to={item.path || `/product/${item.id}`} className="block bg-gray-100">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="aspect-[4/5] w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{name}</h2>
                        {item.category && <p className="mt-1 text-sm text-gray-500">{item.category}</p>}
                      </div>

                      {(removeFromWishlist || removeWishlistItem || toggleWishlist) && (
                        <button
                          type="button"
                          onClick={() => removeLikedItem(item)}
                          aria-label={`Remove ${name}`}
                          className="text-gray-400 transition hover:text-pink-500"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-lg font-extrabold text-gray-900">{price}</p>
                      <Link
                        to={item.path || `/product/${item.id}`}
                        className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-pink-300 hover:text-pink-500"
                      >
                        View item
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
