import { Routes, Route } from "react-router";

import PrivateAuthRoute from "../markup/components/Auth/PrivateAuthRoute";
import AdminIndex from "../markup/pages/admin/AdminIndex";
import Dashboard from "../markup/pages/admin/Dashboard";
import Admins from "../markup/pages/admin/Admins";
import Customers from "../markup/pages/admin/Customers";
import Loans from "../markup/pages/admin/Loans";
import Payments from "../markup/pages/admin/Payments";
import AddUserForm from "../markup/components/Admin/AddUserForm/AddUserForm";
import AddLoanForm from "../markup/components/Admin/AddLoanForm/AddLoanForm";
import AddPaymentForm from "../markup/components/Admin/AddPaymentForm/AddPaymentForm";
import Customer from "../markup/pages/admin/Customer";
import Loan from "../markup/pages/admin/Loan";
import Payment from "../markup/pages/admin/Payment";
import EditUser from "../markup/components/Admin/EditUser/EditUser";
import EditLoan from "../markup/components/Admin/EditLoan/EditLoan";
import EditPayment from "../markup/components/Admin/EditPayment/EditPayment";
import ServerError from "../markup/pages/500";
import NotFound from "../markup/pages/404";

function AdminRoutes() {
    return (
        <PrivateAuthRoute roles={[1]}>
            <AdminIndex>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/500" element={<ServerError />} />
                    <Route path="/admin/adminlist" element={<Admins />} />
                    <Route path="/admin/customerlist" element={<Customers />} />
                    <Route path="/admin/loanlist" element={<Loans />} />
                    <Route path="/admin/paymentlist" element={<Payments />} />
                    <Route path="/admin/add-user" element={<AddUserForm />} />
                    <Route path="/admin/add-loan" element={<AddLoanForm />} />
                    <Route path="/admin/add-payment" element={<AddPaymentForm />} />
                    <Route path="/admin/customer/:hashId" element={<Customer />} />
                    <Route path="/admin/loan/:hashId" element={<Loan />} />
                    <Route path="/admin/payment/:hashId" element={<Payment />} />
                    <Route path="/admin/edit/user/:hashId" element={<EditUser />} />
                    <Route path="/admin/edit/Loan/:hashId" element={<EditLoan />} />
                    <Route path="/admin/edit/payment/:hashId" element={<EditPayment />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AdminIndex>
        </PrivateAuthRoute>
    );
}

export default AdminRoutes;
