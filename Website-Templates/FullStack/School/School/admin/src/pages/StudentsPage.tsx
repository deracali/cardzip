import { useState } from 'react'
import { Download, Search, UserPlus } from 'lucide-react'
import { students } from '../data'
import { PageHeader, Panel } from '../components/PageHeader'

export function StudentsPage() {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = students.filter((row) => row.join(' ').toLowerCase().includes(query.toLowerCase()))
  const exportCsv = () => {
    const csv = ['Student,ID,Class,Status', ...filtered.map((row) => row.join(','))].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'greenfield-students.csv'
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('Student list exported.')
  }
  return <><PageHeader title="Student records" description="Search and review student enrollment details." action={<button className="primary-button" onClick={() => setNotice('Add-student request saved in this demo.')}><UserPlus size={14}/> Add student</button>}/><Panel title="Student directory" note={`${filtered.length} records shown`} action={<button className="secondary-button" onClick={exportCsv}><Download size={14}/> Export CSV</button>}><label className="search-field"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID, or class"/></label><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>CLASS</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{filtered.map(([name, id, className, status]) => <tr key={id}><td><b>{name}</b><small>Student · Greenfield College</small></td><td>{id}</td><td>{className}</td><td><span className={`status ${status.toLowerCase()}`}>{status}</span></td><td><button className="table-link" onClick={() => setNotice(`${name} profile opened in demo.`)}>View profile</button></td></tr>)}</tbody></table></div>{notice&&<p className="inline-notice" role="status">{notice}</p>}</Panel></>
}
