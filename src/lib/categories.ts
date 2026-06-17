export interface SubcategoryConfig {
  slug: string;
  name: string;
}

export interface CategoryConfig {
  slug: string;
  name: string;
  subcategories: SubcategoryConfig[];
}

export const CATEGORIES_DATA: CategoryConfig[] = [
  {
    slug: "women",
    name: "Women",
    subcategories: [
      { slug: "dresses", name: "Dresses" },
      { slug: "jeans", name: "Jeans" },
      { slug: "skirts", name: "Skirts" },
      { slug: "tops-blouses", name: "Tops & Blouses" },
      { slug: "knitwear", name: "Knitwear & Sweaters" },
      { slug: "outerwear", name: "Coats & Jackets" },
      { slug: "shoes", name: "Luxury Footwear" }
    ]
  },
  {
    slug: "men",
    name: "Men",
    subcategories: [
      { slug: "shirts", name: "Shirts" },
      { slug: "jeans", name: "Denim & Jeans" },
      { slug: "suits-tailoring", name: "Suits & Tailoring" },
      { slug: "outerwear", name: "Jackets & Coats" },
      { slug: "hoodies-sweats", name: "Hoodies & Sweatshirts" },
      { slug: "shoes", name: "Footwear & Sneakers" }
    ]
  },
  {
    slug: "kids",
    name: "Kids",
    subcategories: [
      { slug: "baby-unisex", name: "Baby & Toddler" },
      { slug: "girls-clothing", name: "Girls Fashion" },
      { slug: "boys-clothing", name: "Boys Fashion" },
      { slug: "shoes", name: "Kids Footwear" }
    ]
  }
];