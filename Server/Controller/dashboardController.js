const { StatusCodes } = require("http-status-codes");

const {
    getTotalCustomerAndLoanStats, getInterestPieData, getTransactions, getLoanBarData
} = require("./../Services/dashboardService/getDashboardData.service");
async function dashboardData(req, res) {
    try {
        
        const dashInfo = await getTotalCustomerAndLoanStats();
        const pieData = await getInterestPieData();
        const barData = await getLoanBarData();
        const tableData = await getTransactions();
        const dashData = {
            "infoData": dashInfo.infoData,
            "pieData": pieData.pieData,
            "barData": barData,
            "tableData": tableData.transaction
        }
        
        return res.status(StatusCodes.OK).json({ response: dashData });
    } catch (err) {
        console.error("Error in getting dashboard datas", err);
        return res.status(StatusCodes.BAD_REQUEST).json({ response: { msg: "Error in fetching dashboard data" } });
    }
}
module.exports = { dashboardData };