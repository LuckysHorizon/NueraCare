import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons";

export default defineType({
  name: "chatConversation",
  title: "Chat Conversation",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "reportId",
      title: "Report ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "role",
              title: "Role",
              type: "string",
              options: { list: ["user", "assistant"] },
            }),
            defineField({
              name: "text",
              title: "Message Text",
              type: "text",
            }),
            defineField({
              name: "timestamp",
              title: "Timestamp",
              type: "datetime",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "summary",
      title: "Chat Summary",
      type: "text",
      description: "Auto-generated summary of the conversation",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
    }),
  ],
});
