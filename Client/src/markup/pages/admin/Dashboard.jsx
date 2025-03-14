import { useEffect, useState } from "react";
import { useAuth } from '../../../Contexts/useHook';
import DashPieChart from "../../components/Admin/AdminHome/DashPieChart";
import LoanPaymentList from "../../components/Admin/AdminHome/LoanPaymentList";
import bannerImg from "./../../../assets/images/banner/bannerImage.png";
import DashBarChart from "../../components/Admin/AdminHome/DashBarChart";
import DashInfo from "../../components/Admin/AdminHome/DashInfo";
import dashData from '../../../services/dashboard.service';
import LoadingIndicator from '../../../util/LoadingIndicator';
import deletedService from "../../../services/delete.service";
import { useNavigate } from "react-router";
function Dashboard() {
    const [dashboardData, setDashboardData] = useState({});
    const [loading, setLoading] = useState(true);
    const { setOpenPage } = useAuth();
    const navigate = useNavigate()

    const fetchDashboardData = async () => {
        setLoading(true);
        const tokenOnStorage = localStorage.getItem("user");
        if (!tokenOnStorage){
            navigate("/login"); 
            return;
        }
        const token = JSON.parse(tokenOnStorage);
        try {
            const response = await dashData.getDashboardData(token.token);
            

            if (response.status === 400) {
                setLoading(false);
                navigate("/500");
                return;
            } else if (response.status === 401) {
                navigate("/login");
                setLoading(false);
                return;
            }
            const data = await response.json();
            setDashboardData(data?.response || {});
            setLoading(false);
        } catch (error) {
                setLoading(false);
                navigate("/500");
                return;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setOpenPage("Home");
        fetchDashboardData();
    }, [setOpenPage]);

    const handleDeleteTransactions = async (selectedIds) => {
        const tokenOnStorage = localStorage.getItem("user");
        if (!tokenOnStorage) return;

        const token = JSON.parse(tokenOnStorage);
        try {
            const loanHashIds = [];
            const paymentHashIds = [];
            for (const selectedId of selectedIds) {
                if (selectedId.type === "Loan") {
                    loanHashIds.push(selectedId.hashId);
                } else {
                    paymentHashIds.push(selectedId.hashId);
                }
            }
            if (loanHashIds.length > 0) {
                await deletedService.deletedLoan({ loanHashIds }, token.token);
            }
            if (paymentHashIds.length > 0) {
                await deletedService.deletedPayment({ paymentHashIds }, token.token);
            }
            fetchDashboardData();
        } catch (error) {
            setLoading(false);
            navigate("/500");
            return;
        }
    };

    if (loading) {
        return <LoadingIndicator />
    }

    return (
        <div>
            <div className="2xl:max-w-full 2xl:flex 2xl:justify-center">
                <div>
                    <div className="hidden md:block h-auto md:h-72 w-1/2 bg-center bg-cover mt-[-100px] ml-[30%] transition-opacity duration-500 " ></div>

                    <div className=" mt-[-100px] md:mt-[-180px]">
                        <div className="w-[400px] md:w-[500px] lg:w-[600px] overflow-auto">
                            <DashInfo infoData={dashboardData?.infoData} />
                        </div>

                        <div className="w-full flex flex-col md:justify-content md:flex-col overflow-auto">
                            <div className="flex flex-col md:flex-row space-x-3 w-full md:w-[1200px]">
                                <div className="flex-grow min-w-[620px] w-full mt-4 rounded-3xl shadow-lg">
                                    <DashBarChart data={dashboardData?.barData} width={650} height={300} />
                                </div>
                                <div className="flex-grow w-full mt-8 pb-14 rounded-3xl shadow-lg">
                                    <DashPieChart data={dashboardData?.pieData} width={300} height={300} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col md:justify-content md:flex-col overflow-auto">
                        <div className="flex-grow w-full md:w-[1200px] mt-8">
                            <LoanPaymentList transaction={dashboardData?.tableData} onDeleteTransaction={handleDeleteTransactions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
