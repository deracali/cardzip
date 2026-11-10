import { useState } from 'react'
import { Check, Circle, Search } from 'lucide-react'
import type { AttendanceStudent } from '../types'
import { PageHeader, Panel } from '../components/PageHeader'

export function AttendancePage({ records, onToggle }: { records: AttendanceStudent[]; onToggle: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = records.filter((row) => `${row.name} ${row.className}`.toLowerCase().includes(query.toLowerCase()))
  const present = records.filter((row) => row.present).length
  return <><PageHeader title="Attendance" description="Monitor daily class registers and student presence." action={<button className="primary-button" onClick={() => setNotice('Attendance report prepared in this demo.')}>Export report</button>}/><div className="summary-cards"><article><span>PRESENT TODAY</span><b>94.2%</b><small>{present} of {records.length} demo records present</small></article><article><span>ABSENT</span><b>{records.length - present}</b><small>Current class sample</small></article><article><span>CLASSES SUBMITTED</span><b>78 / 86</b><small>8 registers still pending</small></article></div><Panel title="Class register" note="JSS 3 Gold · Wednesday, 5 November 2026" action={<button className="secondary-button" onClick={() => setNotice('Class register submitted in this demo.')}>Submit register</button>}><label className="search-field"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student"/></label><div className="attendance-list">{filtered.map((row) => <div key={row.id} className="attendance-row"><span className="student-avatar">{row.name.split(' ').map((part) => part[0]).join('')}</span><div className="student-name"><b>{row.name}</b><small>{row.className}</small></div><button className={`attendance-toggle ${row.present ? 'checked' : ''}`} onClick={() => onToggle(row.id)} aria-label={`Mark ${row.name} ${row.present ? 'absent' : 'present'}`}>{row.present ? <Check size={14}/> : <Circle size={14}/>} {row.present ? 'Present' : 'Absent'}</button></div>)}</div>{notice&&<p className="inline-notice" role="status">{notice}</p>}</Panel></>
}
