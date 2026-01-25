import { Sequelize, DataTypes } from 'sequelize';
import { connectionDetails } from '../config/db.js';
import bcrypt from 'bcryptjs';

import InventoryModelsInit from './Inventory.js';
import ReceptionModelsInit from './Reception.js';
import CardManagementModelsInit from './CardManagement.js';
import EventsCertificatesModelsInit from './EventsCertificates.js';
import HumanResourceModelsInit from './HumanResource.js';

let sequelize;

if (connectionDetails && connectionDetails.url) {
  sequelize = new Sequelize(connectionDetails.url, {
    dialect: 'postgres',
    logging: false,
    define: { schema: 'public' },
    searchPath: 'public',
    dialectOptions: connectionDetails.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
} else {
  // Fallback or error if no connection string
  console.warn("No database connection string detected for Sequelize.");
  sequelize = new Sequelize({
    dialect: 'postgres',
    logging: false
  });
}

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'teacher', 'student', 'driver'), allowNull: false, defaultValue: 'student' },
  },
  {
    tableName: 'users',
    timestamps: true,
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } },
  }
);

User.addHook('beforeCreate', async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});
User.addHook('beforeUpdate', async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

const Student = sequelize.define(
  'Student',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    class: { type: DataTypes.STRING },
    section: { type: DataTypes.STRING },
  },
  { tableName: 'students', timestamps: true }
);

const Teacher = sequelize.define(
  'Teacher',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    subjects: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    department: { type: DataTypes.STRING },
  },
  { tableName: 'teachers', timestamps: true }
);

const Assignment = sequelize.define(
  'Assignment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    class: { type: DataTypes.STRING, allowNull: false },
    section: { type: DataTypes.STRING, allowNull: false },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    description: { type: DataTypes.TEXT },
    teacherId: { type: DataTypes.INTEGER },
    submissions: { type: DataTypes.JSONB, defaultValue: [] },
  },
  { tableName: 'assignments', timestamps: true }
);

// Associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Teacher.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Assignment.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

// Initialize module models
const InventoryModels = InventoryModelsInit(sequelize);
const ReceptionModels = ReceptionModelsInit(sequelize);
const CardManagementModels = CardManagementModelsInit(sequelize);
const EventsCertificatesModels = EventsCertificatesModelsInit(sequelize);
const HumanResourceModels = HumanResourceModelsInit(sequelize);

async function initDb() {
  try {
    await sequelize.authenticate();
    // Sync all models including the new ones
    await sequelize.sync();
    try {
      const [rows] = await sequelize.query("SELECT current_database() AS db");
      const db = rows?.[0]?.db;
      console.log(`PostgreSQL connected and models synced via Sequelize (db=${db || 'unknown'})`);
    } catch (_) {
      console.log('PostgreSQL connected and models synced via Sequelize');
    }
  } catch (error) {
    console.error('Sequelize connection error:', error);
  }
}

export {
  sequelize,
  initDb,
  User,
  Student,
  Teacher,
  Assignment,
};

// Re-export all models from modules
export const { Product, Category, Store, Supplier, Unit, Purchase, Sale, Issue } = InventoryModels;
export const { AdmissionEnquiry, PostalRecord, CallLog, VisitorLog, Complaint, ReceptionConfig } = ReceptionModels;
export const { IdCardTemplate, GeneratedIdCard, AdmitCardTemplate, GeneratedAdmitCard } = CardManagementModels;
export const { Event, Certificate, CertificateTemplate, IssuedCertificate, QRAttendance, QRAttendanceSession } = EventsCertificatesModels;
export const { Payroll, AdvanceSalary, Leave, Award } = HumanResourceModels;
