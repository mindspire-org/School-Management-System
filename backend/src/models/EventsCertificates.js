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

    const CertificateTemplate = sequelize.define('CertificateTemplate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.ENUM('Student', 'Employee'), allowNull: false },
        layout: { type: DataTypes.STRING, defaultValue: 'Landscape' },
        bgColor: { type: DataTypes.STRING, defaultValue: '#ffffff' },
        logoUrl: { type: DataTypes.TEXT },
        title: { type: DataTypes.STRING, defaultValue: 'Certificate' },
        bodyText: { type: DataTypes.TEXT },
        footerText: { type: DataTypes.TEXT },
        showBorder: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_border' },
        borderColor: { type: DataTypes.TEXT, defaultValue: '#111111', field: 'border_color' },
        borderWidth: { type: DataTypes.INTEGER, defaultValue: 2, field: 'border_width' },
        borderStyle: { type: DataTypes.TEXT, defaultValue: 'solid', field: 'border_style' },
        borderRadius: { type: DataTypes.INTEGER, defaultValue: 14, field: 'border_radius' },
        backgroundImageUrl: { type: DataTypes.TEXT, field: 'background_image_url' },
        backgroundImageOpacity: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.2, field: 'background_image_opacity' },
        watermarkText: { type: DataTypes.TEXT, field: 'watermark_text' },
        watermarkImageUrl: { type: DataTypes.TEXT, field: 'watermark_image_url' },
        watermarkOpacity: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.08, field: 'watermark_opacity' },
        watermarkRotate: { type: DataTypes.INTEGER, defaultValue: -25, field: 'watermark_rotate' },
        fontFamily: { type: DataTypes.TEXT, defaultValue: 'Georgia, serif', field: 'font_family' },
        titleFontFamily: { type: DataTypes.TEXT, defaultValue: 'Georgia, serif', field: 'title_font_family' },
        titleFontSize: { type: DataTypes.INTEGER, defaultValue: 34, field: 'title_font_size' },
        bodyFontSize: { type: DataTypes.INTEGER, defaultValue: 18, field: 'body_font_size' },
        footerFontSize: { type: DataTypes.INTEGER, defaultValue: 14, field: 'footer_font_size' },
        signature1Name: { type: DataTypes.TEXT, field: 'signature1_name' },
        signature1Title: { type: DataTypes.TEXT, field: 'signature1_title' },
        signature1ImageUrl: { type: DataTypes.TEXT, field: 'signature1_image_url' },
        signature2Name: { type: DataTypes.TEXT, field: 'signature2_name' },
        signature2Title: { type: DataTypes.TEXT, field: 'signature2_title' },
        signature2ImageUrl: { type: DataTypes.TEXT, field: 'signature2_image_url' },
        showSerial: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'show_serial' },
        serialPrefix: { type: DataTypes.TEXT, defaultValue: 'CERT-', field: 'serial_prefix' },
        serialPadding: { type: DataTypes.INTEGER, defaultValue: 6, field: 'serial_padding' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'certificate_templates', timestamps: true });

    const IssuedCertificate = sequelize.define('IssuedCertificate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        certificateType: { type: DataTypes.ENUM('Student', 'Employee'), allowNull: false },
        personId: { type: DataTypes.INTEGER, allowNull: false },
        personName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Unknown' },
        templateId: { type: DataTypes.INTEGER, allowNull: false },
        status: { type: DataTypes.STRING, defaultValue: 'Issued' },
        issueDate: { type: DataTypes.DATEONLY },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'issued_certificates', timestamps: true });

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

    const QRAttendanceSession = sequelize.define('QRAttendanceSession', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        token: { type: DataTypes.STRING, allowNull: false, unique: true },
        attendanceType: { type: DataTypes.ENUM('Student', 'Teacher'), allowNull: false },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
        createdBy: { type: DataTypes.INTEGER },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
    }, { tableName: 'qr_attendance_sessions', timestamps: true });

    return { Event, Certificate, CertificateTemplate, IssuedCertificate, QRAttendance, QRAttendanceSession };
};
