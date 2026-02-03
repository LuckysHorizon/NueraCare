export default {
  name: 'medicalReport',
  type: 'document',
  title: 'Medical Report',
  fields: [
    {
      name: 'clerkId',
      type: 'string',
      title: 'Clerk User ID',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'reportType',
      type: 'string',
      title: 'Report Type',
      options: {
        list: [
          { title: 'Blood Test', value: 'blood-test' },
          { title: 'X-Ray', value: 'xray' },
          { title: 'ECG', value: 'ecg' },
          { title: 'Ultrasound', value: 'ultrasound' },
          { title: 'CT Scan', value: 'ct-scan' },
          { title: 'MRI', value: 'mri' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'reportDate',
      type: 'datetime',
      title: 'Report Date',
    },
    {
      name: 'hospitalName',
      type: 'string',
      title: 'Hospital Name',
    },
    {
      name: 'doctorName',
      type: 'string',
      title: 'Doctor Name',
    },
    {
      name: 'findings',
      type: 'text',
      title: 'Findings',
    },
    {
      name: 'reportFile',
      type: 'file',
      title: 'Report File (PDF)',
      options: {
        accept: 'application/pdf',
      },
    },
    {
      name: 'uploadedAt',
      type: 'datetime',
      title: 'Uploaded At',
    },
  ],
};
