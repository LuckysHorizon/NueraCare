export default {
  name: 'userProfile',
  type: 'document',
  title: 'User Profile',
  fields: [
    {
      name: 'clerkId',
      type: 'string',
      title: 'Clerk User ID',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'firstName',
      type: 'string',
      title: 'First Name',
    },
    {
      name: 'lastName',
      type: 'string',
      title: 'Last Name',
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
    },
    {
      name: 'imageUrl',
      type: 'url',
      title: 'Profile Image URL',
    },
    {
      name: 'bloodGroup',
      type: 'string',
      title: 'Blood Group',
      options: {
        list: [
          { title: 'O+', value: 'O+' },
          { title: 'O-', value: 'O-' },
          { title: 'A+', value: 'A+' },
          { title: 'A-', value: 'A-' },
          { title: 'B+', value: 'B+' },
          { title: 'B-', value: 'B-' },
          { title: 'AB+', value: 'AB+' },
          { title: 'AB-', value: 'AB-' },
        ],
      },
    },
    {
      name: 'age',
      type: 'number',
      title: 'Age',
    },
    {
      name: 'height',
      type: 'number',
      title: 'Height (cm)',
    },
    {
      name: 'weight',
      type: 'number',
      title: 'Weight (kg)',
    },
    {
      name: 'chronicDiseases',
      type: 'text',
      title: 'Chronic Diseases',
    },
    {
      name: 'primaryLanguage',
      type: 'string',
      title: 'Primary Language',
      options: {
        list: [
          { title: 'English', value: 'english' },
          { title: 'Hindi', value: 'hindi' },
          { title: 'Tamil', value: 'tamil' },
          { title: 'Telugu', value: 'telugu' },
          { title: 'Kannada', value: 'kannada' },
          { title: 'Malayalam', value: 'malayalam' },
        ],
      },
    },
    {
      name: 'caregiverName',
      type: 'string',
      title: 'Caregiver Name',
    },
    {
      name: 'caregiverPhone',
      type: 'string',
      title: 'Caregiver Phone',
    },
    {
      name: 'highContrast',
      type: 'boolean',
      title: 'High Contrast Mode',
      initialValue: false,
    },
    {
      name: 'largeTextMode',
      type: 'boolean',
      title: 'Large Text Mode',
      initialValue: true,
    },
    {
      name: 'reducedMotion',
      type: 'boolean',
      title: 'Reduce Motion',
      initialValue: false,
    },
    {
      name: 'voiceMode',
      type: 'boolean',
      title: 'Voice Mode Enabled',
      initialValue: false,
    },
    {
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
    },
    {
      name: 'updatedAt',
      type: 'datetime',
      title: 'Updated At',
    },
  ],
};
