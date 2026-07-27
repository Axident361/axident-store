import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  fetchAdminDashboard,
  updateAdminOrder,
  updateAdminStock,
  type AdminDashboardData,
} from '../utils/adminClient'

interface AdminPageProps {
  onExit: () => void
}

const ORDER_STATUSES = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']

export function AdminPage({ onExit }: AdminPageProps) {
  const [booting, setBooting] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [filter, setFilter] = useState<'all' | 'LOW' | 'OUT'>('all')
  const [stockEdits, setStockEdits] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const dash = await fetchAdminDashboard()
    setData(dash)
    const edits: Record<string, string> = {}
    for (const row of dash.inventory.rows) {
      edits[`${row.productId}::${row.size}`] = String(row.stock)
    }
    setStockEdits(edits)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const ok = await checkAdminSession()
        if (!alive) return
        setAuthed(ok)
        if (ok) await load()
      } catch {
        if (alive) setAuthed(false)
      } finally {
        if (alive) setBooting(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [load])

  const onLogin = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await adminLogin(password)
      setAuthed(true)
      setPassword('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setAuthed(false)
    } finally {
      setBusy(false)
    }
  }

  const onLogout = async () => {
    setBusy(true)
    try {
      await adminLogout()
    } finally {
      setAuthed(false)
      setData(null)
      setBusy(false)
    }
  }

  if (booting) {
    return (
      <section className="admin-page">
        <p className="section-label">// SECURE NODE</p>
        <h1>ADMIN</h1>
        <p className="admin-muted">Checking session…</p>
      </section>
    )
  }

  if (!authed) {
    return (
      <section className="admin-page">
        <p className="section-label">// RESTRICTED UPLINK</p>
        <h1>ADMIN LOGIN</h1>
        <p className="admin-muted">Authorized operators only. Triple-click ONLINE to return here.</p>
        <form className="admin-login" onSubmit={onLogin}>
          <label htmlFor="admin-pass">PASSWORD</label>
          <input
            id="admin-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {error && <p className="admin-error">{error}</p>}
          <div className="admin-actions">
            <button type="submit" className="neon-btn" disabled={busy || !password}>
              {busy ? 'AUTH…' : 'ENTER'}
            </button>
            <button type="button" className="neon-btn secondary" onClick={onExit}>
              EXIT
            </button>
          </div>
        </form>
      </section>
    )
  }

  const m = data?.snapshot.metrics
  const rows =
    data?.inventory.rows.filter((r) => (filter === 'all' ? true : r.status === filter)) ?? []

  return (
    <section className="admin-page">
      <div className="admin-top">
        <div>
          <p className="section-label">// OPS DECK</p>
          <h1>ADMIN DASHBOARD</h1>
          <p className="admin-muted">
            {data?.snapshot.storeName} · {data?.snapshot.slogan} · refreshed{' '}
            {data ? new Date(data.generatedAt).toLocaleString() : '—'}
          </p>
        </div>
        <div className="admin-actions">
          <button type="button" className="neon-btn secondary" onClick={() => void load()} disabled={busy}>
            REFRESH
          </button>
          <button type="button" className="neon-btn secondary" onClick={() => void onLogout()} disabled={busy}>
            LOGOUT
          </button>
          <button type="button" className="neon-btn" onClick={onExit}>
            STOREFRONT
          </button>
        </div>
      </div>

      <div className="admin-metrics">
        <article><span>REV TODAY</span><strong>${m?.revenueToday.toFixed(2) ?? '0.00'}</strong></article>
        <article><span>REV 7D</span><strong>${m?.revenue7d.toFixed(2) ?? '0.00'}</strong></article>
        <article><span>ORDERS TODAY</span><strong>{m?.ordersToday ?? 0}</strong></article>
        <article><span>AOV</span><strong>${m?.avgOrderValue.toFixed(2) ?? '0.00'}</strong></article>
        <article><span>CONV</span><strong>{m?.conversionRate ?? 0}%</strong></article>
        <article><span>ABANDON</span><strong>{m?.cartAbandonRate ?? 0}%</strong></article>
        <article><span>VISITORS</span><strong>{m?.activeVisitors ?? 0}</strong></article>
        <article><span>LOW / OUT</span><strong>{m?.lowStockSkus ?? 0} / {m?.outOfStockSkus ?? 0}</strong></article>
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <h2>ALERTS</h2>
          <ul>
            {(data?.snapshot.alerts ?? []).map((a) => (
              <li key={a}>{a}</li>
            ))}
            {(data?.snapshot.alerts.length ?? 0) === 0 && <li>No active alerts</li>}
          </ul>
        </div>
        <div className="admin-panel">
          <h2>TASKS</h2>
          <ul>
            {(data?.snapshot.tasks ?? []).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <h2>INVENTORY</h2>
          <div className="filter-row">
            {(['all', 'LOW', 'OUT'] as const).map((f) => (
              <button key={f} type="button" className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>CODE</th>
                <th>NAME</th>
                <th>SIZE</th>
                <th>AVAIL</th>
                <th>STOCK</th>
                <th>STATUS</th>
                <th>BIN</th>
                <th>SET</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const key = `${row.productId}::${row.size}`
                return (
                  <tr key={key} className={row.status === 'OUT' ? 'row-out' : row.status === 'LOW' ? 'row-low' : ''}>
                    <td>{row.codename}</td>
                    <td>{row.name}</td>
                    <td>{row.size}</td>
                    <td>{row.available}</td>
                    <td>{row.stock}</td>
                    <td>{row.status}</td>
                    <td>{row.location}</td>
                    <td className="stock-edit">
                      <input
                        value={stockEdits[key] ?? ''}
                        onChange={(e) => setStockEdits((s) => ({ ...s, [key]: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void (async () => {
                            setBusy(true)
                            setError('')
                            try {
                              await updateAdminStock(row.productId, row.size, Number(stockEdits[key] ?? row.stock))
                              await load()
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Stock update failed')
                            } finally {
                              setBusy(false)
                            }
                          })()
                        }}
                      >
                        SAVE
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-panel">
        <h2>ORDERS</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CUSTOMER</th>
                <th>CHANNEL</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>CREATED</th>
                <th>UPDATE</th>
              </tr>
            </thead>
            <tbody>
              {(data?.orders.orders ?? []).map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.channel}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <select
                      defaultValue={o.status}
                      onChange={(e) => {
                        const status = e.target.value
                        void (async () => {
                          setBusy(true)
                          setError('')
                          try {
                            await updateAdminOrder(o.id, status)
                            await load()
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Order update failed')
                          } finally {
                            setBusy(false)
                          }
                        })()
                      }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
    </section>
  )
}
