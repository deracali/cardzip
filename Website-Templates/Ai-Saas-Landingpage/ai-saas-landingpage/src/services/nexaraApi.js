const keys = {
  accounts: 'nexara-local-users',
  userToken: 'nexara-user-token',
  admin: 'nexara-local-admin',
  adminToken: 'nexara-admin-token',
  leads: 'nexara-local-inquiries',
  documents: 'nexara-local-documents',
  demoSeed: 'nexara-local-admin-demo-seed',
}

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    if (!value) return fallback
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed) && (parsed === null || typeof parsed !== 'object')) throw new Error('Invalid saved data.')
    return parsed
  } catch (error) {
    throw new Error(`Could not read saved Nexara browser data (${key}). Clear this site's local storage and try again.`, { cause: error })
  }
}

function readArray(key) {
  const value = read(key, [])
  if (!Array.isArray(value)) throw new Error(`Saved Nexara data (${key}) is invalid. Clear this site's local storage and try again.`)
  return value
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    throw new Error('Your browser could not save this Nexara change. Check available local storage and try again.', { cause: error })
  }
}

function publicUser(user) {
  const sanitized = { ...user }
  delete sanitized.passwordHash
  delete sanitized.passwordSalt
  return sanitized
}

function publicDocument(document) {
  const sanitized = { ...document }
  delete sanitized.contentBase64
  return sanitized
}

function createDemoLeads() {
  const now = Date.now()
  const at = (daysAgo) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  return [
    { id: 'demo-inquiry-northstar', type: 'demo', name: 'Avery Brooks', email: 'avery@northstar.example', company: 'Northstar Labs', message: 'We are exploring AI support triage and would like a walkthrough of the Pro workspace for our customer success team.', plan: 'Pro', billing: 'annual', status: 'new', response: '', createdAt: at(1), isDemo: true },
    { id: 'demo-inquiry-alpine', type: 'contact', name: 'Mina Patel', email: 'mina@alpinehealth.example', company: 'Alpine Health', message: 'Could you share how Nexara keeps answers grounded in our approved internal documentation?', plan: '', billing: '', status: 'contacted', response: 'Thanks for reaching out. We can walk your team through a source-aware knowledge workflow and answer your security questions.', respondedAt: at(2), createdAt: at(4), isDemo: true },
    { id: 'demo-inquiry-brightpath', type: 'checkout', name: 'Theo Martin', email: 'theo@brightpath.example', company: 'BrightPath Logistics', message: 'We are comparing Enterprise options for a distributed operations team. Please send over the next steps for a planning call.', plan: 'Enterprise', billing: 'monthly', status: 'qualified', response: 'We have your Enterprise request. A workspace specialist can help map the rollout to your teams and systems.', respondedAt: at(5), createdAt: at(7), isDemo: true },
    { id: 'demo-inquiry-fieldnote', type: 'signup', name: 'Rina Okafor', email: 'rina@fieldnote.example', company: 'Fieldnote Studio', message: 'We would like to try the free workspace and learn how to organize our first team workflow.', plan: 'Starter', billing: 'monthly', status: 'new', response: '', createdAt: at(10), isDemo: true },
  ]
}

function createDemoDocuments() {
  const now = Date.now()
  const at = (daysAgo) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString()
  return [
    {
      id: 'demo-doc-getting-started',
      slug: 'getting-started-with-nexara',
      title: 'Getting started with Nexara',
      description: 'A practical introduction to setting up a workspace, choosing a first use case, and keeping a person in the review loop.',
      filename: 'getting-started-with-nexara.md',
      contentType: 'text/markdown',
      contentBase64: btoa('# Getting started with Nexara\n\n## Start with one clear task\nChoose a repeatable piece of work with a clear outcome, such as sorting support requests or finding an approved answer. Keep the first workflow small enough for your team to review.\n\n## Connect trusted knowledge\nSelect the documents and sources your team is allowed to use. Check ownership and freshness before relying on them.\n\n## Review before expanding\nTest the workflow with realistic examples. Ask teammates to check its answers and handoffs, then refine the instructions before adding more use cases.\n\n## Keep a human in control\nUse review steps for sensitive or uncertain work. Nexara is designed to prepare useful next actions while leaving important decisions with your team.'),
      createdAt: at(2),
      isDemo: true,
    },
    {
      id: 'demo-doc-human-review',
      slug: 'designing-human-reviewed-workflows',
      title: 'Designing human-reviewed workflows',
      description: 'How to define approval points, handle uncertain results, and make ownership clear in AI-assisted work.',
      filename: 'human-reviewed-workflows.md',
      contentType: 'text/markdown',
      contentBase64: btoa('# Designing human-reviewed workflows\n\n## Decide what needs approval\nList the actions that can happen automatically and the decisions that must be checked by a person. Keep approval rules specific to the task.\n\n## Make review useful\nShow the reviewer the request, the proposed result, and the sources used. A reviewer should be able to approve, edit, or send the work back with context.\n\n## Plan for uncertainty\nIf information is missing or sources disagree, pause the workflow and route the case to the right teammate instead of guessing.\n\n## Improve from feedback\nReview common corrections with your team. Update source material and workflow instructions so future work is clearer.'),
      createdAt: at(5),
      isDemo: true,
    },
    {
      id: 'demo-doc-knowledge',
      slug: 'maintaining-a-trusted-knowledge-base',
      title: 'Maintaining a trusted knowledge base',
      description: 'A lightweight routine for keeping team guidance current, owned, and ready for AI-assisted workflows.',
      filename: 'trusted-knowledge-base.md',
      contentType: 'text/markdown',
      contentBase64: btoa('# Maintaining a trusted knowledge base\n\n## Give each guide an owner\nAssign a team or person to review important documents. Include a last-reviewed date and a clear point of contact.\n\n## Prefer focused, current guidance\nBreak large handbooks into useful topics. Archive outdated copies and point readers to the current source.\n\n## Include practical context\nExplain who a policy applies to, what action to take, and when to ask for help. Use examples where they remove ambiguity.\n\n## Check sources regularly\nReview frequently used guidance on a schedule and whenever a process changes. Remove material that is no longer approved.'),
      createdAt: at(9),
      isDemo: true,
    },
  ]
}

function currentUserForToken(token) {
  if (!token) return null
  const account = readArray(keys.accounts).find((user) => user.id === token)
  if (!account) return null
  return publicUser(account)
}

async function hashPassword(password, salt) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 120000, hash: 'SHA-256' }, material, 256)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export const nexaraApi = {
  async submitLead(lead, token) {
    const user = currentUserForToken(token)
    const record = {
      id: crypto.randomUUID(),
      ...lead,
      ...(user ? { userId: user.id, name: user.name, email: user.email } : {}),
      company: String(lead.company || ''),
      message: String(lead.message || ''),
      plan: String(lead.plan || ''),
      billing: String(lead.billing || ''),
      status: 'new',
      response: '',
      createdAt: new Date().toISOString(),
    }
    write(keys.leads, [record, ...readArray(keys.leads)])
    return { data: record }
  },
  async signUp({ name, email, password }) {
    const accounts = readArray(keys.accounts)
    const normalizedEmail = email.trim().toLowerCase()
    if (accounts.some((user) => user.email === normalizedEmail)) throw new Error('An account with this email already exists in this browser.')
    const passwordSalt = crypto.randomUUID()
    const user = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordSalt,
      passwordHash: await hashPassword(password, passwordSalt),
      createdAt: new Date().toISOString(),
    }
    write(keys.accounts, [user, ...accounts])
    return { token: user.id, user: publicUser(user) }
  },
  async login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    const user = readArray(keys.accounts).find((account) => account.email === normalizedEmail)
    if (!user || await hashPassword(password, user.passwordSalt) !== user.passwordHash) throw new Error('Email or password is incorrect.')
    return { token: user.id, user: publicUser(user) }
  },
  async currentUser(token) {
    const user = currentUserForToken(token)
    if (!user) throw new Error('Your local account is not available. Please sign in again.')
    return { user }
  },
  async accountLeads(token) {
    const user = currentUserForToken(token)
    if (!user) throw new Error('Your local account is not available. Please sign in again.')
    return { data: readArray(keys.leads).filter((lead) => lead.userId === user.id) }
  },
  async adminLogin({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    const savedAdmin = read(keys.admin, null)
    if (!savedAdmin) {
      if (!normalizedEmail || password.length < 8) throw new Error('Use an email and a password of at least 8 characters to set up local admin access.')
      const passwordSalt = crypto.randomUUID()
      write(keys.admin, { email: normalizedEmail, passwordSalt, passwordHash: await hashPassword(password, passwordSalt) })
    } else if (normalizedEmail !== savedAdmin.email || await hashPassword(password, savedAdmin.passwordSalt) !== savedAdmin.passwordHash) {
      throw new Error('Admin email or password is incorrect.')
    }
    return { token: 'local-admin-session' }
  },
  async adminLeads(token) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to view inquiries.')
    return { data: readArray(keys.leads) }
  },
  async seedAdminDemoData(token) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to load sample data.')
    if (localStorage.getItem(keys.demoSeed)) return { seeded: false }
    if (readArray(keys.leads).length === 0) write(keys.leads, createDemoLeads())
    if (readArray(keys.documents).length === 0) write(keys.documents, createDemoDocuments())
    write(keys.demoSeed, 'v1')
    return { seeded: true }
  },
  async updateLead(token, id, changes) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to update inquiries.')
    let updated
    const leads = readArray(keys.leads).map((lead) => {
      if (lead.id !== id) return lead
      updated = { ...lead, ...changes, respondedAt: changes.response ? new Date().toISOString() : lead.respondedAt }
      return updated
    })
    if (!updated) throw new Error('Inquiry was not found in this browser.')
    write(keys.leads, leads)
    return { data: updated }
  },
  async publicDocuments() {
    return { data: readArray(keys.documents).map(publicDocument) }
  },
  async publicDocument(slug) {
    const document = readArray(keys.documents).find((item) => item.slug === slug)
    if (!document) throw new Error('Document was not found in this browser.')
    return { data: document }
  },
  async adminDocuments(token) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to view documents.')
    return { data: readArray(keys.documents).map(publicDocument) }
  },
  async uploadDocument(token, document) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to publish documents.')
    if (!document.slug || !document.contentBase64) throw new Error('Add a title and select a supported document before publishing.')
    const documents = readArray(keys.documents)
    if (documents.some((item) => item.slug === document.slug)) throw new Error('A document with this title already exists.')
    const record = { id: crypto.randomUUID(), ...document, createdAt: new Date().toISOString() }
    write(keys.documents, [record, ...documents])
    return { data: publicDocument(record) }
  },
  async deleteDocument(token, id) {
    if (token !== localStorage.getItem(keys.adminToken)) throw new Error('Admin sign in is required to delete documents.')
    const documents = readArray(keys.documents)
    if (!documents.some((document) => document.id === id)) throw new Error('Document was not found in this browser.')
    write(keys.documents, documents.filter((document) => document.id !== id))
    return { data: { id } }
  },
}

export const getUserToken = () => localStorage.getItem(keys.userToken)
export const setUserToken = (token) => token ? localStorage.setItem(keys.userToken, token) : localStorage.removeItem(keys.userToken)
export const getAdminToken = () => localStorage.getItem(keys.adminToken)
export const setAdminToken = (token) => token ? localStorage.setItem(keys.adminToken, token) : localStorage.removeItem(keys.adminToken)
