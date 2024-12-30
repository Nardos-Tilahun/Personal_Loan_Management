CREATE TABLE IF NOT EXISTS UserRole (
    UserRoleId INT PRIMARY KEY AUTO_INCREMENT,
    UserRoleName VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS UserInfo (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    Date_Created TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
    UserRoleId INT,
    UserImage VARCHAR(255),
    CreatedBy INT,
    FOREIGN KEY (UserRoleId) REFERENCES UserRole(UserRoleId),
    FOREIGN KEY (CreatedBy) REFERENCES UserInfo(UserID)
);

CREATE TABLE IF NOT EXISTS UserPass (
    UserPassID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    UserHashID VARCHAR(100),
    UserHashPass VARCHAR(255),
    UserPassUpdate TIMESTAMP,
    token VARCHAR(255),
    token_expires_at VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES UserInfo(UserID)
);

CREATE TABLE IF NOT EXISTS UserAddress (
    UserAddressID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    PhoneNumber VARCHAR(20),
    SecondPhoneNumber VARCHAR(20),
    StreetAddress VARCHAR(50),
    City VARCHAR(50),
    State VARCHAR(50),
    Country VARCHAR(50),
    ZipCode VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES UserInfo(UserID)
);

CREATE TABLE IF NOT EXISTS UserPayment (
    UserPayID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT,
    IsActive BOOLEAN,
    IsDelete TIMESTAMP,
    IsVerified TIMESTAMP,
    Score INT,
    FOREIGN KEY (UserID) REFERENCES UserInfo(UserID)
);

CREATE TABLE IF NOT EXISTS LoanInfo (
    LoanID INT PRIMARY KEY AUTO_INCREMENT,
    LoanAmount DECIMAL(15, 2),
    LoanCurrency VARCHAR(255),
    LoanBegin TIMESTAMP,
    LoanStartDate TIMESTAMP,
    GivenBy INT,
    UserID INT,
    FOREIGN KEY (UserID) REFERENCES UserInfo(UserID)
);

CREATE TABLE IF NOT EXISTS LoanDetail (
    LoanDetailID INT PRIMARY KEY AUTO_INCREMENT,
    LoanID INT,
    LoanPeriod VARCHAR(50),
    LoanTerm INT,
    Collateral VARCHAR(255),
    LoanPurpose VARCHAR(255),
    LoanExpirationDate TIMESTAMP,
    LoanHashID VARCHAR(100),
    FOREIGN KEY (LoanID) REFERENCES LoanInfo(LoanID)
);

CREATE TABLE IF NOT EXISTS LoanInterest (
    LoanInterestID INT PRIMARY KEY AUTO_INCREMENT,
    LoanID INT,
    LoanInterestRate DECIMAL(5, 2),
    LoanAccrued DECIMAL(15, 2),
    TotalInterestPaid DECIMAL(15, 2),
    InterestLeft DECIMAL(15, 2),
    FOREIGN KEY (LoanID) REFERENCES LoanInfo(LoanID)
);

CREATE TABLE IF NOT EXISTS LoanPayment (
    LoanPaymentID INT PRIMARY KEY AUTO_INCREMENT,
    LoanID INT,
    LoanPaymentMethod VARCHAR(50),
    FixedTermPayment DECIMAL(15, 2),
    LastTermPayment  DECIMAL(15, 2),
    PayedPayment DECIMAL(15, 2),
    RemainingPayment DECIMAL(15, 2),
    NextPaymentExpirationDate TIMESTAMP,
    NextPaymentAmount DECIMAL(15, 2),
    LatePaymentCount INT,
    PenalityPayment DECIMAL(15, 2),
    Status VARCHAR(20),
    FOREIGN KEY (LoanID) REFERENCES LoanInfo(LoanID)
);

CREATE TABLE IF NOT EXISTS PaymentInfo (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    PaymentAmount DECIMAL(15, 2),
    PaymentCurrency  VARCHAR(20),
    PaymentConversionRate DECIMAL(15, 2),
    PaymentDate TIMESTAMP,
    PaymentTerm INT,
    ApprovedBy INT,
    LoanID INT,
    FOREIGN KEY (LoanID) REFERENCES LoanInfo(LoanID)
);

CREATE TABLE IF NOT EXISTS PaymentDetail (
    PaymentDetailID INT PRIMARY KEY AUTO_INCREMENT,
    PaymentID INT,
    PaymentMethod VARCHAR(50),
    NextPaymentTerm INT,
    InterestPaid DECIMAL(15, 2),
    PrincipalPaid DECIMAL(15, 2),
    PaymentNote TEXT,
    PaymentHashID VARCHAR(100),
    FOREIGN KEY (PaymentID) REFERENCES PaymentInfo(PaymentID)
);

CREATE TABLE IF NOT EXISTS PaymentLate (
    PaymentLateID INT PRIMARY KEY AUTO_INCREMENT,
    PaymentID INT,
    LatePaymentReason TEXT,
    PenalityRate DECIMAL(15, 2),
    PenalityPayment DECIMAL(15, 2),
    FOREIGN KEY (PaymentID) REFERENCES PaymentInfo(PaymentID)
);

INSERT INTO UserRole (UserRoleId, UserRoleName) 
    SELECT * FROM (SELECT 1, 'Admin') AS tmp
    WHERE NOT EXISTS (
        SELECT UserRoleId FROM UserRole WHERE UserRoleId = 1
    ) LIMIT 1;

INSERT INTO UserRole (UserRoleId, UserRoleName) 
    SELECT * FROM (SELECT 2, 'Customer') AS tmp
    WHERE NOT EXISTS (
        SELECT UserRoleId FROM UserRole WHERE UserRoleId = 2
    ) LIMIT 1;
