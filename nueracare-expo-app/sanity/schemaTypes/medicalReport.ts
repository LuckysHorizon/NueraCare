import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export default defineType({
  name: "medicalReport",
  title: "Medical Report",
  type: "document",
  icon: DocumentTextIcon,
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
      name: "fileUrl",
      title: "File URL",
      type: "url",
    }),
    defineField({
      name: "extractedText",
      title: "Extracted Text",
      type: "text",
      readOnly: true,
    }),
    defineField({
      name: "uploadDate",
      title: "Upload Date",
      type: "datetime",
    }),
    defineField({
      name: "reportType",
      title: "Report Type",
      type: "string",
      options: {
        list: [
          { title: "Blood Test", value: "blood-test" },
          { title: "X-Ray", value: "xray" },
          { title: "ECG", value: "ecg" },
          { title: "Ultrasound", value: "ultrasound" },
          { title: "CT Scan", value: "ct-scan" },
          { title: "MRI", value: "mri" },
          { title: "Other", value: "other" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID (Deprecated)",
      type: "string",
      deprecated: {
        reason: "Use userId instead.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "reportDate",
      title: "Report Date (Deprecated)",
      type: "datetime",
      deprecated: {
        reason: "Use uploadDate instead.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "hospitalName",
      title: "Hospital Name (Deprecated)",
      type: "string",
      deprecated: {
        reason: "No longer used by backend.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "doctorName",
      title: "Doctor Name (Deprecated)",
      type: "string",
      deprecated: {
        reason: "No longer used by backend.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "findings",
      title: "Findings (Deprecated)",
      type: "text",
      deprecated: {
        reason: "Use extractedText instead.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "reportFile",
      title: "Report File (Deprecated)",
      type: "file",
      options: {
        accept: "application/pdf",
      },
      deprecated: {
        reason: "Use fileUrl instead.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      name: "uploadedAt",
      title: "Uploaded At (Deprecated)",
      type: "datetime",
      deprecated: {
        reason: "Use uploadDate instead.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
  ],
});
