import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const AdmissionEnquiry = sequelize.define('AdmissionEnquiry', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        studentName: { type: DataTypes.STRING, allowNull: false },
        parentName: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING },
        class: { type: DataTypes.STRING },
        status: { type: DataTypes.ENUM('Pending', 'Contacted', 'Admitted', 'Rejected'), defaultValue: 'Pending' },
        notes: { type: DataTypes.TEXT },
        followUpDate: { type: DataTypes.DATE },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'admission_enquiries', timestamps: true });

    const PostalRecord = sequelize.define('PostalRecord', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        type: { type: DataTypes.ENUM('Incoming', 'Outgoing'), allowNull: false },
        sender: { type: DataTypes.STRING, allowNull: false },
        recipient: { type: DataTypes.STRING, allowNull: false },
        subject: { type: DataTypes.STRING },
        trackingNumber: { type: DataTypes.STRING },
        status: { type: DataTypes.ENUM('Pending', 'Delivered', 'Sent'), defaultValue: 'Pending' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'postal_records', timestamps: true });

    const CallLog = sequelize.define('CallLog', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        time: { type: DataTypes.STRING },
        callerName: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING },
        purpose: { type: DataTypes.STRING },
        notes: { type: DataTypes.TEXT },
        followUp: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'call_logs', timestamps: true });

    const VisitorLog = sequelize.define('VisitorLog', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING },
        idType: { type: DataTypes.STRING },
        idNumber: { type: DataTypes.STRING },
        purpose: { type: DataTypes.TEXT },
        personToMeet: { type: DataTypes.STRING },
        checkIn: { type: DataTypes.STRING },
        checkOut: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'visitor_logs', timestamps: true });

    const Complaint = sequelize.define('Complaint', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        complainant: { type: DataTypes.STRING, allowNull: false },
        contact: { type: DataTypes.STRING },
        category: { type: DataTypes.ENUM('Facilities', 'Administration', 'Academic', 'Transport', 'Other'), allowNull: false },
        priority: { type: DataTypes.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
        subject: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Resolved', 'Closed'), defaultValue: 'Pending' },
        assignedTo: { type: DataTypes.STRING },
        resolution: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'complaints', timestamps: true });

    const ReceptionConfig = sequelize.define('ReceptionConfig', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        visitorBadgeTemplate: { type: DataTypes.STRING },
        autoNotification: { type: DataTypes.BOOLEAN, defaultValue: true },
        requireIDVerification: { type: DataTypes.BOOLEAN, defaultValue: true },
        complaintCategories: { type: DataTypes.TEXT },
        autoAssignment: { type: DataTypes.BOOLEAN, defaultValue: false },
        workingHours: { type: DataTypes.STRING },
        receptionEmail: { type: DataTypes.STRING },
        receptionContact: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'reception_configs', timestamps: true });

    return { AdmissionEnquiry, PostalRecord, CallLog, VisitorLog, Complaint, ReceptionConfig };
};
