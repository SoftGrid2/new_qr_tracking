import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-brand">Product QR Admin</div>
      <nav className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/add-product">Add Product</Link>
        <Link to="/bulk-upload">Bulk Upload</Link>
        <Link to="/products">Products</Link>
      </nav>
    </header>
  );
};

export default Navbar;
