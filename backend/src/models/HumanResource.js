import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Payroll = sequelize.define('Payroll', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        employeeName: { type: DataTypes.STRING, allowNull: false },
        month: { type: DataTypes.STRING, allowNull: false },
        year: { type: DataTypes.INTEGER, allowNull: false },
        basicSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        allowances: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        netSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: { type: DataTypes.ENUM('Pending', 'Paid'), defaultValue: 'Pending' },
        paymentDate: { type: DataTypes.DATE },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'payrolls', timestamps: true });

    const AdvanceSalary = sequelize.define('AdvanceSalary', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        employeeName: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        reason: { type: DataTypes.TEXT },
        requestDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
        approvedBy: { type: DataTypes.STRING },
        rejectionReason: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'advance_salaries', timestamps: true });

    const Leave = sequelize.define('Leave', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        employeeName: { type: DataTypes.STRING, allowNull: false },
        leaveType: { type: DataTypes.STRING, allowNull: false },
        startDate: { type: DataTypes.DATE, allowNull: false },
        endDate: { type: DataTypes.DATE, allowNull: false },
        reason: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'), defaultValue: 'Pending' },
        approvedBy: { type: DataTypes.STRING },
        rejectionReason: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'leaves', timestamps: true });

    const Award = sequelize.define('Award', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        employeeId: { type: DataTypes.INTEGER, allowNull: false },
        employeeName: { type: DataTypes.STRING, allowNull: false },
        awardName: { type: DataTypes.STRING, allowNull: false },
        giftItem: { type: DataTypes.STRING },
        cashPrice: { type: DataTypes.DECIMAL(10, 2) },
        reason: { type: DataTypes.TEXT },
        givenDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'awards', timestamps: true });

    return { Payroll, AdvanceSalary, Leave, Award };
};
