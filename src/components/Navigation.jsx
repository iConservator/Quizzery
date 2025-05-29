import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
      <Link to="/">Головна</Link>
      <Link to="/add">Додати тести</Link>
      <Link to="/learn">Навчання</Link>
      <Link to="/test">Тестування</Link>
    </nav>
  );
}