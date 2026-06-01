import { defineField, defineType } from "sanity";

export default defineType({
  name: "sizeGuide",
  title: "Size Guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'e.g. "Ready-to-Wear Size Guide"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Link this size guide to a product category",
      options: {
        list: [
          { title: "Ready to Wear", value: "ready-to-wear" },
          { title: "Bridal", value: "bridal" },
          { title: "Dupatta", value: "dupatta" },
          { title: "Accessories", value: "accessories" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "measurements",
      title: "Measurements",
      type: "array",
      description: "Add size rows with measurement columns. Leave empty to add later.",
      of: [
        {
          type: "object",
          name: "sizeRow",
          fields: [
            defineField({ name: "size", title: "Size", type: "string" }),
            defineField({ name: "bust", title: "Bust (inches)", type: "string" }),
            defineField({ name: "waist", title: "Waist (inches)", type: "string" }),
            defineField({ name: "hips", title: "Hips (inches)", type: "string" }),
            defineField({ name: "length", title: "Length (inches)", type: "string" }),
          ],
          preview: {
            select: { title: "size" },
          },
        },
      ],
    }),
    defineField({
      name: "notes",
      title: "Additional Notes",
      type: "text",
      rows: 3,
      description: "Optional fitting tips or measurement instructions.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
    },
  },
});
