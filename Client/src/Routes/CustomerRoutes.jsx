import React from 'react';
import { Route, Routes } from "react-router";
import PrivateAuthRoute from "../markup/components/Auth/PrivateAuthRoute";
import CustomerIndex from "../markup/pages/customer/CustomerIndex";
import CustomerLanding from "../markup/pages/customer/CustomerLanding";
import Loan from '../markup/pages/admin/Loan';
import ServerError from '../markup/pages/500';
import NotFound from '../markup/pages/404';

function CustomerRoutes() {

    return (
        <PrivateAuthRoute roles={[2]}>
            <CustomerIndex>
                <Routes>
                    <Route path="/" element={<CustomerLanding />} />
                    <Route path="/500" element={<ServerError />} />
                    <Route path="/customer/Loan/:hashId" element={<Loan />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </CustomerIndex>
        </PrivateAuthRoute>
    );
}

export default CustomerRoutes