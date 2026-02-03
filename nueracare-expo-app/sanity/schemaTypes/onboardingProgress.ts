export default {
  name: 'onboardingProgress',
  type: 'document',
  title: 'Onboarding Progress',
  fields: [
    {
      name: 'clerkId',
      type: 'string',
      title: 'Clerk User ID',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'welcomeCompleted',
      type: 'boolean',
      title: 'Welcome Screen Completed',
      initialValue: false,
    },
    {
      name: 'healthInfoCompleted',
      type: 'boolean',
      title: 'Health Info Completed',
      initialValue: false,
    },
    {
      name: 'accessibilityCompleted',
      type: 'boolean',
      title: 'Accessibility Screen Completed',
      initialValue: false,
    },
    {
      name: 'permissionsCompleted',
      type: 'boolean',
      title: 'Permissions Completed',
      initialValue: false,
    },
    {
      name: 'onboardingCompleted',
      type: 'boolean',
      title: 'Full Onboarding Completed',
      initialValue: false,
    },
    {
      name: 'currentStep',
      type: 'string',
      title: 'Current Step',
      options: {
        list: [
          { title: 'Welcome', value: 'welcome' },
          { title: 'Health Info', value: 'health-info' },
          { title: 'Accessibility', value: 'accessibility' },
          { title: 'Permissions', value: 'permissions' },
          { title: 'Complete', value: 'complete' },
        ],
      },
    },
    {
      name: 'startedAt',
      type: 'datetime',
      title: 'Onboarding Started',
    },
    {
      name: 'completedAt',
      type: 'datetime',
      title: 'Onboarding Completed',
    },
  ],
};
