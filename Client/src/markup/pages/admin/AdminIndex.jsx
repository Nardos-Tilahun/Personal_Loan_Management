import PropTypes from 'prop-types';

import Sidebar from '../../components/Admin/AdminHome/Sidebar';
import Banner from '../../components/Admin/AdminHome/Banner';

const AdminIndex = ({ children }) => {

    return (
        <div className="relative z-10">
            <Sidebar />
            <div className="relative z-10">
                <Banner />
                <div className="min-w-screen ml-10 md:ml-72 sm:ml-72 sm:mt-24">
                    {children}
                </div>
            </div>
        </div>
    );
};

AdminIndex.propTypes = {
    children: PropTypes.node
};

export default AdminIndex;