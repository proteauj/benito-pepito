import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/data/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  if (category) {
    const filtered = products.filter((p) => p.category === (category as Product['category']));
    return NextResponse.json(filtered);
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return NextResponse.json(productsByCategory);
}

import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/data/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find(p => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  if (category) {
    const filtered = products.filter(p => p.category === (category as Product['category']));
    return NextResponse.json(filtered);
  }

  const categories = [...new Set(products.map(p => p.category))];
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return NextResponse.json(productsByCategory);
}

import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/data/products';

// Product interface
interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  artist: string;
  medium: string;
  year: number;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');
    images: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504198266285-165a9b2ad223?w=800&h=800&fit=crop"
    ],
    category: "Painting",
    inStock: false,
    rating: 4.7,
    reviews: 654,
    artist: "L. Moreau",
    medium: "Mixed Media",
    year: 2021,
  },

  // Fashion Category
  {
    id: "f1",
    slug: "designer-jacket",
    title: "Acrylic on Linen – Horizon",
    description: "Wide, quiet bands of color suggesting a distant shoreline at dawn.",
    price: 299,
    originalPrice: 399,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=800&fit=crop"
    ],
    category: "Painting",
    inStock: true,
    rating: 4.5,
    reviews: 432,
    artist: "M. Conte",
    medium: "Acrylic on Linen",
    year: 2020,
  },
  {
    id: "f2",
    slug: "casual-sneakers",
    title: "Bronze Figure – Poise",
    description: "Lost-wax cast bronze figure capturing a moment of stillness and tension.",
    price: 89,
    originalPrice: 129,
    image: "https://images.unsplash.com/photo-1593697820638-21f2863f0e2f?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1593697820638-21f2863f0e2f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1572705824045-3a89b7330704?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1602524209076-0e2bd173f07d?w=800&h=800&fit=crop"
    ],
    category: "Sculpture",
    inStock: false,
    rating: 4.3,
    reviews: 789,
    artist: "S. Okoye",
    medium: "Bronze",
    year: 2019,
  },
  {
    id: "f3",
    slug: "summer-dress",
    title: "Watercolor Study – Wild Meadow",
    description: "Loose brushwork and layered washes evoke grasses in wind.",
    price: 79,
    image: "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504198266285-165a9b2ad223?w=800&h=800&fit=crop"
    ],
    category: "Painting",
    inStock: true,
    rating: 4.4,
    reviews: 567,
    artist: "N. Arman",
    medium: "Watercolor",
    year: 2024,
  },

  // Home & Garden Category
  {
    id: "h1",
    slug: "modern-coffee-table",
    title: "Garden Cairn – River Stones",
    description: "Stacked river stones forming a meditative garden cairn; suitable for exterior placement.",
    price: 540,
    originalPrice: 620,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop"
    ],
    category: "Home & Garden",
    inStock: true,
    rating: 4.6,
    reviews: 234,
    artist: "E. Santos",
    medium: "Stone (Exterior)",
    year: 2018,
  },
  {
    id: "h2",
    slug: "indoor-plant-set",
    title: "Living Wall Panel – Fern Study",
    description: "Modular living wall panel with ferns and moss; irrigation-ready installation.",
    price: 980,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop"
    ],
    category: "Home & Garden",
    inStock: false,
    rating: 4.7,
    reviews: 345,
    artist: "T. Nguyen",
    medium: "Living Installation",
    year: 2022,
  },
  {
    id: "h3",
    slug: "decorative-lamp",
    title: "Stone Planter – Moss Basin",
    description: "Hand-carved stone basin planted with mosses; designed to patinate outdoors.",
    price: 420,
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=800&fit=crop"
    ],
    category: "Home & Garden",
    inStock: true,
    rating: 4.5,
    reviews: 178,
    artist: "R. Cohen",
    medium: "Stone & Moss",
    year: 2020,
  },

  // Sports Category
  {
    id: "s1",
    slug: "yoga-mat-premium",
    title: "Basalt Stack – Balance",
    description: "Basalt stones arranged in a precarious vertical stack; a study of gravity and form.",
    price: 49,
    originalPrice: 69,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=800&fit=crop"
    ],
    category: "Sculpture",
    inStock: true,
    rating: 4.8,
    reviews: 892,
    artist: "V. Ionescu",
    medium: "Stone",
    year: 2017,
  },
  {
    id: "s2",
    slug: "running-shoes",
    title: "Ink on Paper – Gesture Series",
    description: "Spontaneous marks exploring rhythm and movement.",
    price: 159,
    image: "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504198266285-165a9b2ad223?w=800&h=800&fit=crop"
    ],
    category: "Painting",
    inStock: true,
    rating: 4.6,
    reviews: 1123,
    artist: "C. Adams",
    medium: "Ink on Paper",
    year: 2021,
  },
  {
    id: "s3",
    slug: "fitness-tracker",
    title: "Canvas Diptych – Tides",
    description: "Two canvases in dialogue: ebb and flow rendered in layered pigment.",
    price: 199,
    originalPrice: 249,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1504198266285-165a9b2ad223?w=800&h=800&fit=crop"
    ],
    category: "Painting",
    inStock: false,
    rating: 4.4,
    reviews: 456,
    artist: "J. Patel",
    medium: "Oil and Pigment on Canvas",
    year: 2023,
  }
];

// GET all products or filter by category/slug
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find(p => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  if (category) {
    const filteredProducts = products.filter(p => p.category === category);
    return NextResponse.json(filteredProducts);
  }

  const categories = [...new Set(products.map(p => p.category))];
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return NextResponse.json(productsByCategory);
}
