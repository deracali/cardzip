import { useState } from 'react'
import {
  UserPlus,
  ShieldCheck,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X
} from 'lucide-react'


const initialStaffList = [
  {
    id: 'STF-101',
    name: 'Adaeze Okonkwo',
    email: 'adaeze.o@cardsip.com',
    phone: '+234 812 345 6789',
    role: 'Root Super-Admin',
    department: 'Executive',
    status: 'Active',
    assignedDate: 'Jan 10, 2025',
    avatar: 'AO'
  },
  {
    id: 'STF-102',
    name: 'Tunde Bakare',
    email: 'tunde.b@cardsip.com',
    phone: '+234 803 112 4490',
    role: 'Virtual Numbers Admin',
    department: 'Telecom Operations',
    status: 'Active',
    assignedDate: 'Mar 14, 2025',
    avatar: 'TB'
  },
  {
    id: 'STF-103',
    name: 'Chiamaka Eze',
    email: 'chiamaka.e@cardsip.com',
    phone: '+234 902 881 0021',
    role: 'Giftcard Auditor',
    department: 'Finance & Compliance',
    status: 'Active',
    assignedDate: 'Jun 01, 2025',
    avatar: 'CE'
  },
  {
    id: 'STF-104',
    name: 'Paloma Bello',
    email: 'paloma.b@cardsip.com',
    phone: '+234 815 990 1234',
    role: 'Support Desk Lead',
    department: 'Customer Success',
    status: 'Suspended',
    assignedDate: 'Aug 22, 2025',
    avatar: 'PB'
  }
]

const availableRoles = [
  { title: 'Root Super-Admin', permissions: 'Full access to all modules, financial floats, and staff management' },
  { title: 'Virtual Numbers Admin', permissions: 'Manage virtual-number rentals and service availability' },
  { title: 'Giftcard Auditor', permissions: 'Review card trades, rate updates, code verification, and user payouts' },
  { title: 'Support Desk Lead', permissions: 'View orders, assist customers, re-send verification codes, read-only logs' }
]

export default function StaffPage() {
  const [staffList, setStaffList] = useState(initialStaffList)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // New Staff Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Operations',
    role: 'Support Desk Lead'
  })

  const handleAddStaff = (e) => {
    e.preventDefault()
    if (!newStaff.name || !newStaff.email) return

    const initials = newStaff.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()

    const createdStaff = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone || 'N/A',
      role: newStaff.role,
      department: newStaff.department,
      status: 'Active',
      assignedDate: 'Just now',
      avatar: initials || 'ST'
    }

    setStaffList([createdStaff, ...staffList])
    setShowModal(false)
    setNewStaff({ name: '', email: '', phone: '', department: 'Operations', role: 'Support Desk Lead' })
  }

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="staff-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff & Role Management</h1>
          <p className="page-subtitle">
            Provision team accounts, assign administrative roles, and enforce system access controls.
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={15} /> Add New Staff Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="staff-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Staff Members</span>
          <span className="stat-value">{staffList.length}</span>
          <span className="stat-sub text-emerald">All accounts verified</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Administrators</span>
          <span className="stat-value">
            {staffList.filter((s) => s.status === 'Active').length}
          </span>
          <span className="stat-sub">With active 2FA</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">System Roles Configured</span>
          <span className="stat-value">4</span>
          <span className="stat-sub">Role-Based Access (RBAC)</span>
        </div>
      </div>

      {/* Main Staff Table */}
      <div className="section-card">
        <div className="card-header flex-between">
          <h3>Team Members & Roles</h3>
          <div className="search-box-sm">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search staff name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Contact Info</th>
                <th>Department</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="staff-user-cell">
                      <div className="staff-avatar">{member.avatar}</div>
                      <div>
                        <div className="font-bold">{member.name}</div>
                        <div className="text-muted font-mono" style={{ fontSize: '11px' }}>
                          {member.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <span><Mail size={12} /> {member.email}</span>
                      <span className="text-muted"><Phone size={12} /> {member.phone}</span>
                    </div>
                  </td>
                  <td>{member.department}</td>
                  <td>
                    <span className="badge-role font-bold">{member.role}</span>
                  </td>
                  <td>
                    <span className={`badge-pill ${member.status.toLowerCase()}`}>
                      {member.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {member.status}
                    </span>
                  </td>
                  <td className="text-muted">{member.assignedDate}</td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit Role"><Edit2 size={14} /></button>
                      <button className="btn-icon text-rose" title="Revoke Access"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Matrix Reference Section */}
      <div className="section-card">
        <div className="card-header">
          <h3>Role Permission Hierarchy</h3>
        </div>
        <div className="roles-grid">
          {availableRoles.map((r, i) => (
            <div className="role-card" key={i}>
              <div className="role-card-header">
                <ShieldCheck size={18} className="text-emerald" />
                <h4>{r.title}</h4>
              </div>
              <p className="role-desc">{r.permissions}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assign / Add Staff Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign New Staff Member</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="modal-body">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Adebayo"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Work Email Address</label>
                <input
                  type="email"
                  placeholder="samuel.a@cardsip.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  placeholder="+234 800 000 0000"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                >
                  <option value="Executive">Executive</option>
                  <option value="Operations">Operations</option>
                  <option value="Telecom Operations">Telecom Operations</option>
                  <option value="Finance & Compliance">Finance & Compliance</option>
                  <option value="Customer Success">Customer Success</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assign System Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                >
                  {availableRoles.map((r, i) => (
                    <option key={i} value={r.title}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create & Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}