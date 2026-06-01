import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Ready to Wear', value: 'ready-to-wear' },
          { title: 'Bridal', value: 'bridal' },
          { title: 'Dupatta', value: 'dupatta' },
          { title: 'Accessories', value: 'accessories' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'occasion',
      title: 'Occasion',
      type: 'string',
      description: 'Used for filtering Bridal products',
      options: {
        list: [
          { title: 'Nikkah', value: 'nikkah' },
          { title: 'Walima', value: 'walima' },
          { title: 'Mehndi', value: 'mehndi' },
          { title: 'Barat', value: 'barat' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'comparePrice',
      title: 'Compare-at Price',
      type: 'number',
      description: 'Original price before discount (optional)',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'sizes',
      title: 'Sizes',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'details',
      title: 'Details',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet-point details (fabric, care, etc.)',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'quantity',
      title: 'Stock Quantity',
      type: 'number',
      description: 'Current stock count. Set to 0 for out-of-stock. Low-stock warning shows when ≤ 5.',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      media: 'images.0',
    },
  },
});
