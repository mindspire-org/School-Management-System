import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const IdCardTemplate = sequelize.define('IdCardTemplate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.ENUM('Student', 'Employee'), allowNull: false },
        layout: { type: DataTypes.ENUM('Vertical', 'Horizontal'), defaultValue: 'Vertical' },
        bgColor: { type: DataTypes.STRING, defaultValue: '#4299E1' },
        logoUrl: { type: DataTypes.STRING },
        fields: { type: DataTypes.TEXT },
        instructions: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'id_card_templates', timestamps: true });

    const GeneratedIdCard = sequelize.define('GeneratedIdCard', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        cardType: { type: DataTypes.ENUM('Student', 'Employee'), allowNull: false },
        personId: { type: DataTypes.INTEGER, allowNull: false },
        personName: { type: DataTypes.STRING, allowNull: false },
        templateId: { type: DataTypes.INTEGER },
        generatedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        qrCode: { type: DataTypes.TEXT },
        status: { type: DataTypes.ENUM('Generated', 'Printed', 'Issued'), defaultValue: 'Generated' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'generated_id_cards', timestamps: true });

    const AdmitCardTemplate = sequelize.define('AdmitCardTemplate', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        examName: { type: DataTypes.STRING, field: 'exam_name' },
        layout: { type: DataTypes.ENUM('Vertical', 'Horizontal'), defaultValue: 'Vertical' },
        bgColor: { type: DataTypes.STRING, defaultValue: '#4299E1' },
        logoUrl: { type: DataTypes.STRING },
        fields: { type: DataTypes.TEXT },
        instructions: { type: DataTypes.TEXT },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'admit_card_templates', timestamps: true });

    const GeneratedAdmitCard = sequelize.define('GeneratedAdmitCard', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        studentId: { type: DataTypes.INTEGER, allowNull: false },
        studentName: { type: DataTypes.STRING, allowNull: false },
        examId: { type: DataTypes.INTEGER },
        examName: { type: DataTypes.STRING },
        class: { type: DataTypes.STRING },
        templateId: { type: DataTypes.INTEGER },
        generatedDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        status: { type: DataTypes.ENUM('Generated', 'Printed', 'Issued'), defaultValue: 'Generated' },
        campusId: { type: DataTypes.INTEGER, allowNull: false },
    }, { tableName: 'generated_admit_cards', timestamps: true });

    return { IdCardTemplate, GeneratedIdCard, AdmitCardTemplate, GeneratedAdmitCard };
};
