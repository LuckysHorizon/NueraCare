export default {
  name: 'onboardingData',
  type: 'document',
  title: 'Onboarding Data',
  fields: [
    {
      name: 'clerkId',
      type: 'string',
      title: 'Clerk User ID',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
      validation: (Rule: any) => Rule.required().email(),
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
      name: 'mobileNumber',
      type: 'string',
      title: 'Mobile Number',
      description: 'Phone number with country code (e.g., +1234567890)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'ageGroup',
      type: 'string',
      title: 'Age Group',
      options: {
        list: [
          { title: '18–30', value: '18-30' },
          { title: '31–45', value: '31-45' },
          { title: '46–60', value: '46-60' },
          { title: '60+', value: '60+' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'preferredName',
      type: 'string',
      title: 'Preferred Name',
      description: 'Optional name user prefers to be called',
    },
    {
      name: 'accessibilityNeeds',
      type: 'array',
      title: 'Accessibility Needs',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Large Text', value: 'large-text' },
          { title: 'High Contrast', value: 'high-contrast' },
          { title: 'Screen Reader', value: 'screen-reader' },
          { title: 'Voice Input', value: 'voice-input' },
          { title: 'Closed Captions', value: 'closed-captions' },
        ],
      },
    },
    {
      name: 'caregiverInfo',
      type: 'object',
      title: 'Caregiver Information',
      fields: [
        {
          name: 'hasCaregivers',
          type: 'boolean',
          title: 'Has Caregivers',
          initialValue: false,
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
          name: 'caregiverRelation',
          type: 'string',
          title: 'Relationship',
          options: {
            list: [
              { title: 'Spouse', value: 'spouse' },
              { title: 'Child', value: 'child' },
              { title: 'Parent', value: 'parent' },
              { title: 'Sibling', value: 'sibling' },
              { title: 'Friend', value: 'friend' },
              { title: 'Professional Care', value: 'professional' },
              { title: 'Other', value: 'other' },
            ],
          },
        },
      ],
    },
    {
      name: 'healthContext',
      type: 'object',
      title: 'Health Context',
      fields: [
        {
          name: 'hasConditions',
          type: 'boolean',
          title: 'Has Medical Conditions',
          initialValue: false,
        },
        {
          name: 'conditions',
          type: 'array',
          title: 'Medical Conditions',
          of: [{ type: 'string' }],
        },
        {
          name: 'medications',
          type: 'array',
          title: 'Current Medications',
          of: [{ type: 'string' }],
        },
        {
          name: 'allergies',
          type: 'array',
          title: 'Known Allergies',
          of: [{ type: 'string' }],
        },
        {
          name: 'surgeries',
          type: 'array',
          title: 'Previous Surgeries',
          of: [{ type: 'string' }],
        },
      ],
    },
    {
      name: 'permissions',
      type: 'object',
      title: 'App Permissions',
      fields: [
        {
          name: 'cameraAccess',
          type: 'boolean',
          title: 'Camera Access',
          initialValue: false,
        },
        {
          name: 'locationAccess',
          type: 'boolean',
          title: 'Location Access',
          initialValue: false,
        },
        {
          name: 'notificationsAccess',
          type: 'boolean',
          title: 'Notifications Access',
          initialValue: false,
        },
        {
          name: 'storageAccess',
          type: 'boolean',
          title: 'Storage Access',
          initialValue: false,
        },
        {
          name: 'contactsAccess',
          type: 'boolean',
          title: 'Contacts Access',
          initialValue: false,
        },
      ],
    },
    {
      name: 'reminders',
      type: 'object',
      title: 'Reminder Preferences',
      fields: [
        {
          name: 'medicationReminders',
          type: 'boolean',
          title: 'Medication Reminders',
          initialValue: true,
        },
        {
          name: 'appointmentReminders',
          type: 'boolean',
          title: 'Appointment Reminders',
          initialValue: true,
        },
        {
          name: 'healthCheckReminders',
          type: 'boolean',
          title: 'Health Check Reminders',
          initialValue: true,
        },
        {
          name: 'reminderTime',
          type: 'string',
          title: 'Preferred Reminder Time',
          description: 'Time format: HH:MM',
        },
      ],
    },
    {
      name: 'focusAreas',
      type: 'array',
      title: 'Health Focus Areas',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Heart Health', value: 'heart-health' },
          { title: 'Mental Wellness', value: 'mental-wellness' },
          { title: 'Fitness & Exercise', value: 'fitness' },
          { title: 'Nutrition', value: 'nutrition' },
          { title: 'Sleep', value: 'sleep' },
          { title: 'Stress Management', value: 'stress' },
          { title: 'Chronic Condition Management', value: 'chronic-condition' },
          { title: 'Preventive Care', value: 'preventive-care' },
        ],
      },
    },
    {
      name: 'onboardingCompleted',
      type: 'boolean',
      title: 'Onboarding Completed',
      initialValue: false,
    },
    {
      name: 'onboardingCompletedAt',
      type: 'datetime',
      title: 'Onboarding Completed At',
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
