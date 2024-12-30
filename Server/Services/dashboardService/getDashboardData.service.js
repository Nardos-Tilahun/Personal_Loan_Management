const dbConnection = require("../../Config/dbConfig");

async function getTotalCustomerAndLoanStats() {
    try {
        const totalCustomerQuery = `
            SELECT COUNT(DISTINCT UP.UserID) AS totalCustomer
                    FROM UserPayment UP
                    JOIN UserInfo UI ON UP.UserID = UI.UserID
                    JOIN UserRole UR ON UI.UserRoleId = UR.UserRoleId
                    WHERE (UP.IsDelete IS NULL OR UP.IsDelete = 0)
                    AND UR.UserRoleName = 'Customer';

        `;

        const activeCustomerQuery = `
            SELECT COUNT(DISTINCT UI.UserID) AS activeCustomerCount
            FROM UserInfo UI
            LEFT JOIN UserPayment UP ON UI.UserID = UP.UserID
            LEFT JOIN LoanInfo LI ON UI.UserID = LI.UserID
            LEFT JOIN LoanPayment LP ON LI.LoanID = LP.LoanID
            WHERE 
                (UP.IsDelete IS NULL OR UP.IsDelete = 0) 
                AND UP.IsActive = TRUE 
                AND UI.UserRoleId = (SELECT UserRoleId FROM UserRole WHERE UserRoleName = 'Customer')
                AND (
                    LI.LoanID IS NOT NULL AND LP.Status IN ('Active', 'Pending')
                )
        `;





        const loansAndAmountsQuery = `
            SELECT 
                SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAmount ELSE 0 END) AS TotalLendUSD,
                SUM(CASE WHEN LoanCurrency = 'PESO' THEN LoanAmount ELSE 0 END) AS TotalLendPESO,
                SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAmount ELSE 0 END) - COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN PayedPayment ELSE 0 END), 0) AS TotalOutstandingLendUSD,
                SUM(CASE WHEN LoanCurrency = 'PESO' THEN LoanAmount ELSE 0 END) - COALESCE(SUM(CASE WHEN LoanCurrency = 'PESO' THEN PayedPayment ELSE 0 END), 0) AS TotalOutstandingLendPESO
            FROM LoanInfo LI
            LEFT JOIN LoanPayment LP ON LI.LoanID = LP.LoanID
            WHERE LI.LoanID IN (SELECT LoanID FROM LoanDetail)
        `;


        const [totalCustomerResult, activeCustomerResult, loansAndAmountsResult] = await Promise.all([
            dbConnection.query(totalCustomerQuery),
            dbConnection.query(activeCustomerQuery),
            dbConnection.query(loansAndAmountsQuery)
        ]);

        const customer = totalCustomerResult[0][0].totalCustomer;
        const activeCustomer = activeCustomerResult[0][0].activeCustomerCount;
        const totalLoanUSD = loansAndAmountsResult[0][0].TotalLendUSD;
        const outstandingLoanUSD = loansAndAmountsResult[0][0].TotalOutstandingLendUSD;

        return {
            infoData: {
                "customer": customer,
                "activeCustomer": activeCustomer,
                "totalLoanUSD": totalLoanUSD,
                "outstandingLoanUSD": outstandingLoanUSD,
            }
        };
    } catch (error) {
        throw error;
    }
}
async function getLoanBarData() {
    try {
        const periodicalLoanAndInterestQuery = `
            WITH RECURSIVE
            year_index AS(
                SELECT 4 AS i
                UNION ALL
                SELECT i - 1 FROM year_index WHERE i > 0
            ),
            month_index AS(
                SELECT 9 AS i
                UNION ALL
                SELECT i - 1 FROM month_index WHERE i > 0
            ),
            week_index AS(
                SELECT 9 AS i
                UNION ALL
                SELECT i - 1 FROM week_index WHERE i > 0
            )
            SELECT
                CONCAT(YEAR(DATE_SUB(CURDATE(), INTERVAL (i) YEAR))) AS period,
                CONCAT(YEAR(DATE_SUB(CURDATE(), INTERVAL (i) YEAR)), '-01-01', ' to ', YEAR(DATE_SUB(CURDATE(), INTERVAL i YEAR)), '-12-31') AS dateRange,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAmount ELSE 0 END), 0) AS totalLend,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAccrued ELSE 0 END), 0) AS totalInterest,
                'yearly' AS dataType
            FROM year_index
            LEFT JOIN LoanInfo ON YEAR(LoanBegin) = YEAR(DATE_SUB(CURDATE(), INTERVAL (i) YEAR))
            LEFT JOIN LoanInterest ON LoanInfo.LoanID = LoanInterest.LoanID AND YEAR(LoanInfo.LoanBegin) = YEAR(DATE_SUB(CURDATE(), INTERVAL (i) YEAR))
            GROUP BY period, dateRange  

            UNION ALL

            SELECT
                CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (i) MONTH), '%b, %Y')) AS period,
                CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (i) MONTH), '%Y-%m-01'), ' to ', DATE_FORMAT(LAST_DAY(DATE_SUB(CURDATE(), INTERVAL i MONTH)), '%b %e, %Y')) AS dateRange,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAmount ELSE 0 END), 0) AS totalLend,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAccrued ELSE 0 END), 0) AS totalInterest,
                'monthly' AS dataType
            FROM month_index
            LEFT JOIN LoanInfo ON MONTH(LoanBegin) = MONTH(DATE_SUB(CURDATE(), INTERVAL (i) MONTH)) AND YEAR(LoanBegin) = YEAR(DATE_SUB(CURDATE(), INTERVAL (i) MONTH))
            LEFT JOIN LoanInterest ON LoanInfo.LoanID = LoanInterest.LoanID AND MONTH(LoanInfo.LoanBegin) = MONTH(DATE_SUB(CURDATE(), INTERVAL (i) MONTH)) AND YEAR(LoanInfo.LoanBegin) = YEAR(DATE_SUB(CURDATE(), INTERVAL (i) MONTH))
            GROUP BY period, dateRange 

            UNION ALL

            SELECT
                CONCAT('Week ', i + 1) AS period,
                CONCAT(DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (7 * (i) + WEEKDAY(CURDATE())) DAY), '%b %e, %Y'), ' to ', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL (7 * (i - 1) + WEEKDAY(CURDATE()) + 1) DAY), '%b %e, %Y')) AS dateRange,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAmount ELSE 0 END), 0) AS totalLend,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN LoanAccrued ELSE 0 END), 0) AS totalInterest,
                'weekly' AS dataType
            FROM week_index
            LEFT JOIN LoanInfo ON LoanBegin BETWEEN DATE_SUB(CURDATE(), INTERVAL (7 * (i) + WEEKDAY(CURDATE())) DAY) AND DATE_SUB(CURDATE(), INTERVAL (7 * (i - 1) + WEEKDAY(CURDATE())) DAY)
            LEFT JOIN LoanInterest ON LoanInfo.LoanID = LoanInterest.LoanID AND LoanInfo.LoanBegin BETWEEN DATE_SUB(CURDATE(), INTERVAL (7 * (i) + WEEKDAY(CURDATE())) DAY) AND DATE_SUB(CURDATE(), INTERVAL (7 * (i - 1) + WEEKDAY(CURDATE())) DAY)
            GROUP BY period, dateRange;  

        `;

        const result = await dbConnection.query(periodicalLoanAndInterestQuery);

        const barData = await transformData(result[0])

        return barData

    } catch (error) {
        console.error("Error in retrieving loan bar data:", error);
        throw error;
    }
}
async function transformData(data) {

    const dataTransform = {
        monthlyData: [],
        yearlyData: [],
        weeklyData: []
    };

    data?.forEach(item => {

        const { period, dateRange, totalLend, totalInterest, dataType } = item;

        let newDataItem = {};

        switch (dataType) {
            case 'monthly':
                newDataItem = { month: period, range: dateRange, totalLend: parseFloat(totalLend), totalInterest: parseFloat(totalInterest) };
                dataTransform.monthlyData.unshift(newDataItem);
                break;
            case 'yearly':
                newDataItem = { year: period, range: dateRange, totalLend: parseFloat(totalLend), totalInterest: parseFloat(totalInterest) };
                dataTransform.yearlyData.unshift(newDataItem);
                break;
            case 'weekly':
                newDataItem = { week: period, range: dateRange, totalLend: parseFloat(totalLend), totalInterest: parseFloat(totalInterest) };
                dataTransform.weeklyData.unshift(newDataItem);
                break;
            default:
                break;
        }
    });
    return dataTransform;
}
async function getInterestPieData() {
    try {
        const totalDataQuery = `
            SELECT 
                'Paid Interest (USD)' AS name,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN (LoanAccrued - InterestLeft) ELSE 0 END), 0) AS value
            FROM LoanInterest LI
            JOIN LoanInfo L ON LI.LoanID = L.LoanID
            UNION
            SELECT 
                'Unpaid Interest (USD)' AS name,
                COALESCE(SUM(CASE WHEN LoanCurrency = 'USD' THEN InterestLeft ELSE 0 END), 0) AS value
            FROM LoanInterest LI
            JOIN LoanInfo L ON LI.LoanID = L.LoanID
        `;

        const yearlyDataQuery = `
            SELECT
                'Paid Interest' AS name,
                SUM(LoanAccrued - InterestLeft) AS value
            FROM LoanInterest
            INNER JOIN LoanInfo ON LoanInterest.LoanID = LoanInfo.LoanID
            WHERE YEAR(LoanInfo.LoanBegin) = YEAR(CURRENT_DATE())
            UNION
            SELECT
                'Unpaid Interest' AS name,
                SUM(InterestLeft) AS value
            FROM LoanInterest
            INNER JOIN LoanInfo ON LoanInterest.LoanID = LoanInfo.LoanID
            WHERE YEAR(LoanInfo.LoanBegin) = YEAR(CURRENT_DATE());
        `;

        const monthlyDataQuery = `
            SELECT
                'Paid Interest' AS name,
                SUM(li.LoanAccrued - InterestLeft) AS value
            FROM LoanInterest li
            INNER JOIN LoanInfo ln ON li.LoanID = ln.LoanID
            WHERE ln.LoanBegin >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
            AND ln.LoanCurrency = 'USD'
            UNION
            SELECT
                'Unpaid Interest' AS name,
                SUM(li.InterestLeft) AS value
            FROM LoanInterest li
            INNER JOIN LoanInfo ln ON li.LoanID = ln.LoanID
            WHERE ln.LoanBegin >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
            AND ln.LoanCurrency = 'USD';
        `;
    

        const weeklyDataQuery = `
            SELECT
                'Paid Interest' AS name,
                SUM(li.LoanAccrued - InterestLeft) AS value
            FROM LoanInterest li
            INNER JOIN LoanInfo ln ON li.LoanID = ln.LoanID
            WHERE YEARWEEK(ln.LoanBegin, 1) = YEARWEEK(CURRENT_DATE(), 1)
            AND ln.LoanCurrency = 'USD'
            UNION
            SELECT
                'Unpaid Interest' AS name,
                SUM(li.InterestLeft) AS value
            FROM LoanInterest li
            INNER JOIN LoanInfo ln ON li.LoanID = ln.LoanID
            WHERE YEARWEEK(ln.LoanBegin, 1) = YEARWEEK(CURRENT_DATE(), 1)
            AND ln.LoanCurrency = 'USD';
        `;


        const [totalData, yearlyData, monthlyData, weeklyData] = await Promise.all([
            dbConnection.query(totalDataQuery),
            dbConnection.query(yearlyDataQuery),
            dbConnection.query(monthlyDataQuery),
            dbConnection.query(weeklyDataQuery)
        ]);

        const formattedData = {
            Total: totalData[0],
            Yearly: yearlyData[0],
            Monthly: monthlyData[0],
            Weekly: weeklyData[0]
        };

        return { pieData: formattedData };
    } catch (error) {
        console.error("Error in retrieving interest pie data:", error);
        throw error;
    }
}
async function getTransactions() {
    try {
        const transactionsQuery = `
            SELECT
                id,
                FullName,
                DATE_FORMAT(addeddate, '%b %d, %Y') AS date_Created,
                CASE
                    WHEN type = 'Payment' THEN
                        CASE
                            WHEN status = 'Active' THEN 'On Time'
                            ELSE status
                        END
                    ELSE status
                END AS status,
                currency,
                amount,
                type,
                hashId,
                isRecent
            FROM (
                SELECT
                    CONCAT('P', PI.PaymentID) AS id,
                    CONCAT_WS(' ', UI.FirstName, UI.LastName) AS FullName,
                    PI.PaymentDate AS addeddate,
                    CASE
                        WHEN PL.PaymentLateID IS NOT NULL THEN 'Late'
                        ELSE 'Active'
                    END AS status,
                    PI.PaymentCurrency AS currency,
                    PI.PaymentAmount AS amount,
                    PD.PaymentHashID AS hashId,
                    'Payment' AS type,
                    CASE
                        WHEN PI.PaymentDate = (
                            SELECT MAX(PaymentDate)
                            FROM PaymentInfo
                            WHERE LoanID = LI.LoanID
                        ) THEN 'Recent'
                        ELSE 'Not Recent'
                    END AS isRecent
                FROM
                    PaymentInfo PI
                INNER JOIN
                    LoanInfo LI ON PI.LoanID = LI.LoanID
                INNER JOIN
                    UserInfo UI ON LI.UserID = UI.UserID
                LEFT JOIN
                    PaymentLate PL ON PI.PaymentID = PL.PaymentID
                LEFT JOIN
                    PaymentDetail PD ON PI.PaymentID = PD.PaymentID
                WHERE
                    NOT EXISTS (
                        SELECT 1 
                        FROM UserPayment UP 
                        WHERE UP.UserID = UI.UserID 
                        AND IsDelete IS NOT NULL
                    )
                UNION
                SELECT
                    CONCAT('L', LI.LoanID) AS id,
                    CONCAT_WS(' ', UI.FirstName, UI.LastName) AS FullName,
                    LI.LoanBegin AS addeddate,
                    LP.Status AS status,
                    LI.LoanCurrency AS currency,
                    LI.LoanAmount AS amount,
                    LD.LoanHashID AS hashId,
                    'Loan' AS type,
                    'Recent' AS isRecent
                FROM
                    LoanInfo LI
                INNER JOIN
                    UserInfo UI ON LI.UserID = UI.UserID
                LEFT JOIN
                    LoanPayment LP ON LI.LoanID = LP.LoanID
                LEFT JOIN
                    LoanDetail LD ON LI.LoanID = LD.LoanID
                WHERE
                    NOT EXISTS (
                        SELECT 1 
                        FROM UserPayment UP 
                        WHERE UP.UserID = UI.UserID 
                        AND IsDelete IS NOT NULL
                    )
            ) AS combined_data
            ORDER BY
                addeddate DESC,
                CASE
                    WHEN type = 'Payment' THEN 0
                    ELSE 1
                END;
        `;

        const result = await dbConnection.query(transactionsQuery);
        const formattedTransactions = result[0].map(transaction => ({
            fullName: transaction.FullName,
            Id: transaction.id,
            amount: transaction.amount,
            currency: transaction.currency,
            issueDate: transaction.date_Created,
            transactionType: transaction.type,
            status: transaction.status,
            hashId: transaction.hashId,
            isRecent: transaction.isRecent
        }));

        return { transaction: formattedTransactions };
    } catch (error) {
        console.error("Error in retrieving transactions:", error);
        throw error;
    }
}

module.exports = {
    getTotalCustomerAndLoanStats, getInterestPieData, getTransactions, getLoanBarData
}