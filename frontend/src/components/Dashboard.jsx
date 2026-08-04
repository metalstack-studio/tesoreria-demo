// ============================================================
//  Dashboard.jsx · Layout principal (cuentas + chat)
// ============================================================

import Accounts from './Accounts.jsx';
import Chat from './Chat.jsx';

export default function Dashboard({ onLogout }) {
  return (
    <div className="dashboard">
      <header className="topbar">
        <span className="brand-sm">💰 Tesorería</span>
        <button className="logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <main className="content">
        {/* Columna izquierda: las cuentas */}
        <section className="col col-accounts">
          <Accounts />
        </section>

        {/* Columna derecha: el chat con IA */}
        <section className="col col-chat">
          <Chat />
        </section>
      </main>
    </div>
  );
}
