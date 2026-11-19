import { newId } from "../models/store.js";
import { HttpError, requiredText } from "../utils/http.js";

function validateProduct(input) {
  const name = requiredText(input.name, "Product name", 120, 2);
  const category = requiredText(input.category, "Category", 80, 2);
  const description = requiredText(input.description, "Description", 1200, 10);
  const price = Number(input.price);
  const stock = Number(input.stock);
  if (!Number.isFinite(price) || price <= 0 || price > 1000000) throw new HttpError(400, "Enter a valid product price.");
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) throw new HttpError(400, "Stock must be a whole number between 0 and 100000.");
  let image = "";
  if (input.image) {
    try {
      const url = new URL(input.image);
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid protocol");
      image = url.toString();
    } catch {
      throw new HttpError(400, "Product image must be an HTTP or HTTPS URL.");
    }
  }
  return { name, category, description, price: Math.round(price * 100) / 100, stock, image };
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function createVendorController(store) {
  return {
    dashboard: async (req, res) => {
      const state = await store.read();
      const products = state.products.filter((product) => product.vendorId === req.user.id);
      const orders = state.orders
        .map((order) => ({
          ...order,
          items: order.items.filter((item) => item.vendorId === req.user.id),
        }))
        .filter((order) => order.items.length);
      res.json({ user: req.user, products, orders });
    },

    createProduct: async (req, res) => {
      if (req.user.vendorStatus !== "approved") throw new HttpError(403, "Your shop must be approved before you can list products.");
      const productInput = validateProduct(req.body);
      const product = await store.update((state) => {
        const slug = slugify(productInput.name);
        if (state.products.some((item) => item.slug === slug)) {
          throw new HttpError(409, "A product with a similar name already exists.");
        }
        const created = {
          id: newId("product"),
          slug,
          ...productInput,
          seller: req.user.name,
          sellerSlug: req.user.id,
          vendorId: req.user.id,
          status: "active",
          vendorStatus: "approved",
          createdAt: new Date().toISOString(),
        };
        state.products.unshift(created);
        return created;
      });
      res.status(201).json({ product });
    },

    updateProduct: async (req, res) => {
      if (req.user.vendorStatus !== "approved") throw new HttpError(403, "Your shop must be approved before you can manage products.");
      const updates = {};
      for (const key of ["name", "category", "description", "price", "stock", "image"]) {
        if (Object.hasOwn(req.body, key)) updates[key] = req.body[key];
      }
      const updated = await store.update((state) => {
        const product = state.products.find((item) => item.id === req.params.productId && item.vendorId === req.user.id);
        if (!product) throw new HttpError(404, "Product not found.");
        const validated = validateProduct({ ...product, ...updates });
        Object.assign(product, validated, { slug: slugify(validated.name) });
        return product;
      });
      res.json({ product: updated });
    },

    deleteProduct: async (req, res) => {
      if (req.user.vendorStatus !== "approved") throw new HttpError(403, "Your shop must be approved before you can manage products.");
      await store.update((state) => {
        const index = state.products.findIndex((item) => item.id === req.params.productId && item.vendorId === req.user.id);
        if (index < 0) throw new HttpError(404, "Product not found.");
        state.products[index].status = "archived";
      });
      res.json({ message: "Product archived." });
    },
  };
}
