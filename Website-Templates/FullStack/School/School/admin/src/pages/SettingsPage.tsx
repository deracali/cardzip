import { useState, type FormEvent } from 'react'
import { CheckCircle2, Save, ShieldCheck } from 'lucide-react'
import { PageHeader, Panel } from '../components/PageHeader'

export function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
  }
  return <><PageHeader title="School settings" description="Manage school contact details and portal preferences."/><Panel title="School profile" note="Settings are saved for this browser demo only"><form className="settings-form" onSubmit={submit}><label>School name<input defaultValue="Greenfield College" required/></label><label>School email<input type="email" defaultValue="hello@greenfield.example" required/></label><label>Phone number<input type="tel" defaultValue="+234 800 000 0000"/></label><label>Current academic year<select defaultValue="2026/27"><option>2026/27</option><option>2025/26</option></select></label><label>Current term<select defaultValue="First Term"><option>First Term</option><option>Second Term</option><option>Third Term</option></select></label><label className="check-label"><input type="checkbox" defaultChecked/> Show portal notifications</label><button className="primary-button"><Save size={14}/> Save settings</button>{saved&&<p className="inline-notice" role="status"><CheckCircle2 size={15}/> Settings saved in this demo.</p>}</form></Panel><Panel title="Privacy & access"><div className="privacy-message"><ShieldCheck size={18}/><p>Role-based authentication, approved school privacy terms, data backups, and access logging should be configured before production use.</p></div></Panel></>
}
