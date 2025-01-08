import PropTypes from 'prop-types';
import Banner from '../../components/Admin/AdminHome/Banner';


const CustomerIndex = ({ children }) => {


    return (
        <div className="min-w-screen min-h-screen w-full h-full bg-gray_">
            <div className=" max-w-[1200px] mx-auto relative z-10">
                <Banner />
                <div className="ml-12 mx-auto lg:flex lg:justify-center sm:pt-24">
                    {children}
                </div>
            </div>
        </div>
    );
};

CustomerIndex.propTypes = {
    children: PropTypes.node
};

export default CustomerIndex;