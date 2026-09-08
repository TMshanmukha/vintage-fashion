import {
  getAllFlashSales,
  getFlashSaleById,
  getFlashSaleProducts,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  setFlashSaleProducts,
} from "../../models/marketing/flashSale.model.js";
import {
  resolvePromotionsForProducts,
  applyPromotion,
} from "../pricing/pricing.service.js";

async function attachProducts(sale) {
  if (!sale) return sale;
  const products = await getFlashSaleProducts(sale.flash_sale_id);
  if (!products || !products.length) return { ...sale, products: [] };

  const promotions = await resolvePromotionsForProducts(
    products.map((p) => p.product_id)
  );

  const formattedProducts = products.map((p) => {
    let promo = promotions[p.product_id];
    if (!promo && sale.discount_type && sale.discount_value) {
      promo = {
        discount_type: sale.discount_type,
        discount_value: sale.discount_value,
      };
    }
    const pricing = applyPromotion(p.price, p.original_price, promo);
    return {
      ...p,
      ...pricing,
    };
  });

  return { ...sale, products: formattedProducts };
}

export async function getAllFlashSalesService() {
  const sales = await getAllFlashSales();
  return Promise.all(sales.map(attachProducts));
}

export async function getFlashSaleByIdService(flashSaleId) {
  const sale = await getFlashSaleById(flashSaleId);
  if (!sale) throw new Error("Flash sale not found.");
  return attachProducts(sale);
}

export async function createFlashSaleService(data) {
  const flashSaleId = await createFlashSale(data);
  return attachProducts(await getFlashSaleById(flashSaleId));
}

export async function updateFlashSaleService(flashSaleId, data) {
  const sale = await getFlashSaleById(flashSaleId);
  if (!sale) throw new Error("Flash sale not found.");

  const updated = await updateFlashSale(flashSaleId, data);
  return attachProducts(updated);
}

export async function deleteFlashSaleService(flashSaleId) {
  const sale = await getFlashSaleById(flashSaleId);
  if (!sale) throw new Error("Flash sale not found.");
  await deleteFlashSale(flashSaleId);
}

export async function setFlashSaleProductsService(flashSaleId, productIds) {
  const sale = await getFlashSaleById(flashSaleId);
  if (!sale) throw new Error("Flash sale not found.");

  await setFlashSaleProducts(flashSaleId, productIds);
  return attachProducts(await getFlashSaleById(flashSaleId));
}
