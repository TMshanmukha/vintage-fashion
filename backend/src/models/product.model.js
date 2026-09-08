import pool from "../config/db.js";

const SYNONYMS = {
  "shrt": "shirt",
  "tshirt": "shirt",
  "t-shirt": "shirt",
  "tees": "shirt",
  "tee": "shirt",
  "jckt": "jacket",
  "jacet": "jacket",
  "jaket": "jacket",
  "pnt": "pants",
  "pant": "pants",
  "trousers": "pants",
  "trouser": "pants",
  "denm": "denim",
  "levs": "levis",
  "ralf": "ralph",
  "hilfiger": "tommy"
};

function getKeywords(searchString) {
  if (!searchString) return [];
  return searchString
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => SYNONYMS[word] || word)
    .filter(word => word.length >= 2);
}

export const softDeleteProduct = async (
    productId,
    connection = pool
) => {

    const [result] = await connection.query(
        `
        UPDATE products
        SET
            is_active = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
        `,
        [productId]
    );

    return result;

};

export const updateProduct = async (product, connection) => {

    const [result] = await connection.query(
        `
        UPDATE products
        SET
            category_id = ?,
            brand_id = ?,
            name = ?,
            slug = ?,
            description = ?,
            price = ?,
            original_price = ?,
            badge = ?,
            stock_quantity = ?,
            updated_at = CURRENT_TIMESTAMP

        WHERE product_id = ?
        `,
        [
            product.category_id,
            product.brand_id,
            product.name,
            product.slug,
            product.description,
            product.price,
            product.original_price,
            product.badge,
            product.stock_quantity,
            product.product_id
        ]
    );

    return result;
};

export const deleteProductImages = async (productId, connection) => {

    await connection.query(
        `
        DELETE FROM product_images
        WHERE product_id = ?
        `,
        [productId]
    );

};

export const deleteProductVariants = async (productId, connection) => {

    await connection.query(
        `
        DELETE FROM product_variants
        WHERE product_id = ?
        `,
        [productId]
    );

};

export const countProducts = async (filters) => {

    const {
        search,
        category,
        brand,
        minPrice,
        maxPrice
    } = filters;

    let sql = `
        SELECT COUNT(*) AS total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        LEFT JOIN brands b ON p.brand_id = b.brand_id
        WHERE p.is_active = TRUE
    `;

    const values = [];

    if (search) {
        const keywords = getKeywords(search);
        if (keywords.length > 0) {
            sql += " AND (";
            const clauses = [];
            keywords.forEach(word => {
                clauses.push(`(
                    p.name LIKE ?
                    OR p.description LIKE ?
                    OR c.name LIKE ?
                    OR b.name LIKE ?
                )`);
                values.push(`%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`);
            });
            sql += clauses.join(" OR ");
            sql += ")";
        } else {
            sql += `
                AND (
                    p.name LIKE ?
                    OR p.description LIKE ?
                    OR c.name LIKE ?
                    OR b.name LIKE ?
                )
            `;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
    }

    if (category) {
        sql += ` AND p.category_id = ? `;
        values.push(category);
    }

    if (brand) {
        sql += ` AND p.brand_id = ? `;
        values.push(brand);
    }

    if (minPrice !== undefined) {
        sql += ` AND p.price >= ? `;
        values.push(minPrice);
    }

    if (maxPrice !== undefined) {
        sql += ` AND p.price <= ? `;
        values.push(maxPrice);
    }



    const [rows] = await pool.query(sql, values);

    return rows[0].total;

};

export const getProducts = async ({
    page,
    limit,
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort
}) => {

    let sql = `
        SELECT

            p.product_id,
            p.name,
            p.slug,
            p.price,
            p.original_price,
            p.badge,
            p.average_rating,
            p.review_count,
            p.stock_quantity,

            c.name AS category_name,

            b.name AS brand_name,

            pi.image_url

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.category_id

        LEFT JOIN brands b
            ON p.brand_id = b.brand_id

        LEFT JOIN product_images pi
            ON p.product_id = pi.product_id
            AND pi.is_primary = TRUE

        WHERE p.is_active = TRUE
    `;

    const values = [];

    if (search) {
        const keywords = getKeywords(search);
        if (keywords.length > 0) {
            sql += " AND (";
            const clauses = [];
            keywords.forEach(word => {
                clauses.push(`(
                    p.name LIKE ?
                    OR p.description LIKE ?
                    OR c.name LIKE ?
                    OR b.name LIKE ?
                )`);
                values.push(`%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`);
            });
            sql += clauses.join(" OR ");
            sql += ")";
        } else {
            sql += ` AND (
                p.name LIKE ?
                OR p.description LIKE ?
                OR c.name LIKE ?
                OR b.name LIKE ?
            )`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
    }

    if (category) {
        sql += ` AND p.category_id = ?`;
        values.push(category);
    }

    if (brand) {
        sql += ` AND p.brand_id = ?`;
        values.push(brand);
    }

    if (minPrice) {
        sql += ` AND p.price >= ?`;
        values.push(minPrice);
    }

    if (maxPrice) {
        sql += ` AND p.price <= ?`;
        values.push(maxPrice);
    }

    switch (sort) {

        case "price_low_to_high":
            sql += ` ORDER BY p.price ASC`;
            break;

        case "price_high_to_low":
            sql += ` ORDER BY p.price DESC`;
            break;

        case "name_asc":
            sql += ` ORDER BY p.name ASC`;
            break;

        case "name_desc":
            sql += ` ORDER BY p.name DESC`;
            break;

        case "oldest":
            sql += ` ORDER BY p.created_at ASC`;
            break;

        default: // "newest"
            sql += ` ORDER BY p.created_at DESC`;

    }

    const offset = (page - 1) * limit;

    sql += ` LIMIT ? OFFSET ?`;

    values.push(limit);
    values.push(offset);

    const [rows] = await pool.query(sql, values);

    return rows;
};

export const getProductBySlug = async (slug) => {

    const [rows] = await pool.query(
        `
        SELECT
            p.product_id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.badge,
            p.sku,
            p.is_active,
            p.stock_quantity,
            p.average_rating,
            p.review_count,
            p.created_at,

            c.category_id,
            c.name AS category_name,
            c.slug AS category_slug,

            b.brand_id,
            b.name AS brand_name,
            b.slug AS brand_slug

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.category_id

        LEFT JOIN brands b
            ON p.brand_id = b.brand_id

        LEFT JOIN (
            SELECT product_id, MIN(image_id) AS image_id
            FROM product_images
            WHERE is_primary = TRUE
            GROUP BY product_id
        ) primary_img
            ON primary_img.product_id = p.product_id

        LEFT JOIN product_images pi
            ON pi.image_id = primary_img.image_id

        WHERE p.slug = ?
        AND p.is_active = TRUE

        LIMIT 1
        `,
        [slug]
    );

    return rows[0];
};

export const getProductImages = async (productId) => {

    const [rows] = await pool.query(
        `
        SELECT
            image_id,
            image_url,
            alt_text,
            sort_order,
            is_primary

        FROM product_images

        WHERE product_id = ?

        ORDER BY sort_order ASC
        `,
        [productId]
    );

    return rows;
};

export const getProductVariants = async (productId) => {

    const [rows] = await pool.query(
        `
        SELECT

            variant_id,

            size,

            color,

            color_hex,

            sku_variant,

            stock_quantity,

            price_modifier

        FROM product_variants

        WHERE product_id = ?

        ORDER BY size
        `,
        [productId]
    );

    return rows;
};

export const getRelatedProducts = async (
    categoryId,
    productId
) => {

    const [rows] = await pool.query(
        `
        SELECT

            product_id,

            name,

            slug,

            price,

            original_price,

            badge

        FROM products

        WHERE category_id = ?

          AND product_id <> ?

          AND is_active = TRUE

        LIMIT 4
        `,
        [
            categoryId,
            productId
        ]
    );

    return rows;
};

export const updateProductStock = async (
    connection,
    productId,
    stockQuantity
) => {

    await connection.query(
        `
        UPDATE products
        SET stock_quantity = ?
        WHERE product_id = ?
        `,
        [
            stockQuantity,
            productId
        ]
    );

};

export const createProduct = async (connection, product) => {

    const [result] = await connection.query(
        `
        INSERT INTO products
        (
            category_id,
            brand_id,
            name,
            slug,
            description,
            price,
            original_price,
            badge,
            stock_quantity,
            sku
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            product.category_id,
            product.brand_id,
            product.name,
            product.slug,
            product.description,
            product.price,
            product.original_price,
            product.badge,
            product.stock_quantity,
            product.sku
        ]
    );

    return result.insertId;
};

export const createProductImages = async (
    connection,
    productId,
    images
) => {

    for (const image of images) {

        await connection.query(
            `
            INSERT INTO product_images
            (
                product_id,
                image_url,
                alt_text,
                sort_order,
                is_primary
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                productId,
                image.image_url,
                image.alt_text,
                image.sort_order ?? 1,
                image.is_primary
            ]
        );
    }
};

export const createProductVariants = async (
    connection,
    productId,
    variants
) => {

    if (!variants?.length) return;

    for (const variant of variants) {

        await connection.query(
            `
            INSERT INTO product_variants
            (
                product_id,
                size,
                color,
                color_hex,
                image_url,
                is_default,
                sku_variant,
                stock_quantity,
                price_modifier
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                productId,
                variant.size,
                variant.color,
                variant.color_hex,
                variant.image_url,
                variant.is_default ?? false,
                variant.sku_variant,
                variant.stock_quantity,
                variant.price_modifier
            ]
        );

    }

};

export const updateProductSku = async (
    connection,
    productId,
    sku
) => {

    await connection.query(
        `
        UPDATE products
        SET sku = ?
        WHERE product_id = ?
        `,
        [
            sku,
            productId
        ]
    );

};

export const getProductById = async (connection, productId) => {

    const [rows] = await connection.query(
        `
        SELECT
            p.product_id,
            p.category_id,
            p.brand_id,
            p.name,
            p.slug,
            p.description,
            p.price,
            p.original_price,
            p.badge,
            p.sku,
            p.stock_quantity,
            p.is_active,
            p.created_at,
            p.updated_at,

            c.name AS category_name,
            b.name AS brand_name

        FROM products p

        LEFT JOIN categories c
            ON p.category_id = c.category_id

        LEFT JOIN brands b
            ON p.brand_id = b.brand_id

        WHERE p.product_id = ?

        LIMIT 1
        `,
        [productId]
    );

    if (rows.length === 0) {
        return null;
    }

    const product = rows[0];

    // Fetch Images
    const [images] = await connection.query(
        `
        SELECT
            image_id,
            image_url,
            alt_text,
            sort_order,
            is_primary
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC
        `,
        [productId]
    );

    // Fetch Variants
    const [variants] = await connection.query(
        `
        SELECT
            variant_id,
            size,
            color,
            color_hex,
            image_url,
            is_default,
            sku_variant,
            stock_quantity,
            price_modifier
        FROM product_variants
        WHERE product_id = ?
        ORDER BY variant_id
        `,
        [productId]
    );

    product.images = images;
    product.variants = variants;

    return product;

};

export const updateProductVariant = async (
    connection,
    variant
) => {

    await connection.query(
        `
        UPDATE product_variants
        SET
            size = ?,
            color = ?,
            color_hex = ?,
            image_url = ?,
            is_default = ?,
            sku_variant = ?,
            stock_quantity = ?,
            price_modifier = ?
        WHERE variant_id = ?
        `,
        [
            variant.size,
            variant.color,
            variant.color_hex,
            variant.image_url,
            variant.is_default,
            variant.sku_variant,
            variant.stock_quantity,
            variant.price_modifier,
            variant.variant_id
        ]
    );

};

export const deleteProductVariant = async (
    connection,
    variantId
) => {

    await connection.query(
        `
        DELETE FROM product_variants
        WHERE variant_id = ?
        `,
        [variantId]
    );

};

export const createProductVariant = async (
    connection,
    productId,
    variant
) => {

    await connection.query(
        `
        INSERT INTO product_variants
        (
            product_id,
            size,
            color,
            color_hex,
            image_url,
            is_default,
            sku_variant,
            stock_quantity,
            price_modifier
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            productId,
            variant.size,
            variant.color,
            variant.color_hex,
            variant.image_url,
            variant.is_default ?? false,
            variant.sku_variant,
            variant.stock_quantity,
            variant.price_modifier
        ]
    );

};