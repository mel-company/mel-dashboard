import "./App.css";
import Layout from "./layout/Layout";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import Products from "./pages/product/Products";
import Orders from "./pages/order/Orders";
import ProductDetails from "./pages/product/ProductDetails";
import Customers from "./pages/customer/Customers";
import CustomerDetails from "./pages/customer/CustomerDetails";
import OrderDetails from "./pages/order/OrderDetails";
import Employees from "./pages/employee/Employees";
import EmployeeDetails from "./pages/employee/EmployeeDetails";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        {/* products routes */}
        <Route path="/products">
          <Route index element={<Products />} />
          <Route path=":id" element={<ProductDetails />} />
        </Route>

        {/* customers routes */}
        <Route path="/customers">
          <Route index element={<Customers />} />
          <Route path=":id" element={<CustomerDetails />} />
        </Route>

        {/* orders routes */}
        <Route path="/orders">
          <Route index element={<Orders />} />
          <Route path=":id" element={<OrderDetails />} />
        </Route>

        {/* employees routes */}
        <Route path="/employees">
          <Route index element={<Employees />} />
          <Route path=":id" element={<EmployeeDetails />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
