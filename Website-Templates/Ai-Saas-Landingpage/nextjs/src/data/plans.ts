export const plans = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    description: 'For curious teams getting started with AI.',
    features: ['1,000 AI tasks / month', '3 active agents', 'Community support', 'Core integrations'],
    cta: 'Get started free',
    slug: 'starter',
  },
  {
    name: 'Pro',
    price: { monthly: 39, annual: 29 },
    description: 'For teams ready to automate the busywork.',
    features: ['25,000 AI tasks / month', '25 active agents', 'All 50+ integrations', 'Priority support', 'Private knowledge base'],
    cta: 'Start Pro trial',
    slug: 'pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 129, annual: 99 },
    description: 'For organizations with advanced needs.',
    features: ['Unlimited AI tasks', 'Unlimited agents', 'SSO / SAML & SCIM', 'Dedicated success manager', 'Custom limits & deployment'],
    cta: 'Talk to sales',
    slug: 'enterprise',
  },
]

