import { useState } from "react";
import { applyReminder, isNative, loadReminder, type Reminder, type ReminderContext } from "./native";

/** Native app only: an optional daily notification. Needs the system's notification permission, asked only when switched on. */
export default function ReminderCard({ context }: { context: ReminderContext }) {
  const [reminder, setReminder] = useState<Reminder>(() => loadReminder());
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  if (!isNative()) return null;
  const apply = async (next: Reminder) => {
    setBusy(true); setMessage("");
    try {
      const on = await applyReminder(next, context);
      setReminder({ ...next, on });
      if (next.on && !on) setMessage("Notifications are turned off for Clinicle in your phone's settings.");
    } catch { setMessage("Couldn't change the reminder. Try again."); }
    finally { setBusy(false); }
  };
  const time = String(reminder.hour).padStart(2, "0") + ":" + String(reminder.minute).padStart(2, "0");
  return <section className="settings-card" aria-label="Daily reminder">
    <h2>Daily reminder</h2>
    <p>One notification a day at the time you choose, and it skips days you have already played. It mentions your streak when you have one to protect. It stays on your phone.</p>
    <label className="setting-row"><span><b>Remind me daily</b><small>Turn it off any time.</small></span>
      <input type="checkbox" checked={reminder.on} disabled={busy} onChange={(e) => void apply({ ...reminder, on: e.target.checked })} /></label>
    <div className="account-row"><label htmlFor="reminder-time" style={{ fontWeight: 700, fontSize: 13 }}>Time</label>
      <input id="reminder-time" type="time" value={time} disabled={busy} onChange={(e) => { const [h, m] = e.target.value.split(":").map(Number); if (Number.isFinite(h) && Number.isFinite(m)) void apply({ ...reminder, hour: h, minute: m }); }} /></div>
    {message && <p className="account-notice error" role="status">{message}</p>}
  </section>;
}
