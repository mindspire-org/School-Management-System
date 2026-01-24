import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Event = sequelize.define('Event', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        category: { type: DataTypes.ENUM('Academic', 'Sports', 'Cultural', 'Social', 'Other'), allowNull: false },
        venue: { type: DataTypes.STRING },
        participants: { type: DataTypes.STRING },
        description: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('Planned', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'), defaultValue: 'Planned' },
        organizer: { type: DataTypes.STRING },
        budget: { type: DataTypes.DECIMAL(10, 2) },
        photos: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'events', timestamps: true });

    const Certificate = sequelize.define('Certificate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        certificateType: { type: DataTypes.ENUM('Employee', 'Student'), allowNull: false },
        personId: { type: DataTypes.INTEGER, allowNull: false },
        personName: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false }, // Experience, Appreciation, Achievement, etc.
        issuedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        description: { type: DataTypes.TEXT },
        signedBy: { type: DataTypes.STRING },
        certificateNumber: { type: DataTypes.STRING, unique: true },
        pdfUrl: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'certificates', timestamps: true });

    const QRAttendance = sequelize.define('QRAttendance', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        attendanceType: { type: DataTypes.ENUM('Student', 'Teacher'), allowNull: false },
        personId: { type: DataTypes.INTEGER, allowNull: false },
        personName: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        time: { type: DataTypes.STRING, allowNull: false },
        qrCode: { type: DataTypes.STRING },
        status: { type: DataTypes.ENUM('Present', 'Absent', 'Late'), defaultValue: 'Present' },
        markedBy: { type: DataTypes.STRING },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'qr_attendance', timestamps: true });

    return { Event, Certificate, QRAttendance };
};
